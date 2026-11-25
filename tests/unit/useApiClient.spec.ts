import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, useApiClient } from '~/composables/useApiClient'
import { resetAuthHooks, setAuthHooks } from '~/composables/apiAuth'

const fetchMock = vi.fn()

const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })
const unauth = () => ({
  status: 401,
  data: { success: false, error: { code: 'UNAUTHENTICATED', message: 'expired' } },
})

beforeEach(() => {
  fetchMock.mockReset()
  resetAuthHooks()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('useApiClient', () => {
  it('unwraps the success envelope', async () => {
    fetchMock.mockResolvedValue(ok({ id: 1 }))
    expect(await useApiClient().get('/journal/trades')).toEqual({ id: 1 })
    expect(fetchMock.mock.calls[0][1].baseURL).toBe('/api/v1')
  })

  it('maps an error envelope to ApiError with its code', async () => {
    fetchMock.mockRejectedValue({
      status: 422,
      data: { success: false, error: { code: 'VALIDATION_ERROR', message: 'bad', details: [1] } },
    })
    const err = await useApiClient().post('/x', {}).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ code: 'VALIDATION_ERROR', status: 422, details: [1] })
  })

  it('sends no Authorization header without a token', async () => {
    fetchMock.mockResolvedValue(ok(null))
    await useApiClient().get('/x')
    expect(fetchMock.mock.calls[0][1].headers?.Authorization).toBeUndefined()
  })

  it('sends the bearer token when available', async () => {
    setAuthHooks({ getAccessToken: () => 'tok', refresh: vi.fn(), onSessionExpired: vi.fn() })
    fetchMock.mockResolvedValue(ok(null))
    await useApiClient().get('/x')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok')
  })

  it('refreshes once on 401 and retries with the new token', async () => {
    let token = 'old'
    const refresh = vi.fn(async () => { token = 'new'; return 'ok' as const })
    setAuthHooks({ getAccessToken: () => token, refresh, onSessionExpired: vi.fn() })
    fetchMock.mockRejectedValueOnce(unauth()).mockResolvedValueOnce(ok({ a: 1 }))
    expect(await useApiClient().get('/x')).toEqual({ a: 1 })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new')
  })

  it('calls onSessionExpired when refresh fails and does not loop', async () => {
    const onSessionExpired = vi.fn()
    setAuthHooks({ getAccessToken: () => 'old', refresh: vi.fn(async () => 'expired' as const), onSessionExpired })
    fetchMock.mockRejectedValue(unauth())
    const err = await useApiClient().get('/x').catch((e) => e)
    expect(err).toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('expires the session if the retry is still 401', async () => {
    const onSessionExpired = vi.fn()
    const refresh = vi.fn(async () => 'ok' as const)
    setAuthHooks({ getAccessToken: () => 't', refresh, onSessionExpired })
    fetchMock.mockRejectedValue(unauth())
    await expect(useApiClient().get('/x')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when no hooks are registered', async () => {
    fetchMock.mockRejectedValue(unauth())
    await expect(useApiClient().get('/x')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('supports put/patch/delete and passes FormData through untouched', async () => {
    fetchMock.mockResolvedValue(ok(null))
    const api = useApiClient()
    await api.put('/x', { a: 1 })
    await api.patch('/x', { a: 1 })
    await api.delete('/x')
    expect(fetchMock.mock.calls.map((c) => c[1].method)).toEqual(['PUT', 'PATCH', 'DELETE'])
    const form = new FormData()
    await api.post('/upload', form)
    expect(fetchMock.mock.calls[3][1].body).toBe(form)
    expect(fetchMock.mock.calls[3][1].headers?.['Content-Type']).toBeUndefined()
  })

  it('merges caller headers with Authorization', async () => {
    setAuthHooks({ getAccessToken: () => 'tok', refresh: vi.fn(), onSessionExpired: vi.fn() })
    fetchMock.mockResolvedValue(ok(null))
    await useApiClient().post('/x', {}, { headers: { 'X-Foo': 'bar' } })
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'X-Foo': 'bar', Authorization: 'Bearer tok' })
  })

  it('single-flights refresh: 3 parallel 401s trigger one refresh and all retry', async () => {
    let token = 'old'
    const refresh = vi.fn(async () => {
      await Promise.resolve()
      token = 'new'
      return 'ok' as const
    })
    setAuthHooks({ getAccessToken: () => token, refresh, onSessionExpired: vi.fn() })
    fetchMock.mockImplementation(async (_path: string, options: { headers: Record<string, string> }) => {
      if (options.headers.Authorization === 'Bearer new') return ok({ fine: true })
      throw unauth()
    })
    const api = useApiClient()
    const results = await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')])
    expect(results).toEqual([{ fine: true }, { fine: true }, { fine: true }])
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('retries without refreshing when another request already replaced the token', async () => {
    let token = 'old'
    const refresh = vi.fn(async () => 'ok' as const)
    setAuthHooks({ getAccessToken: () => token, refresh, onSessionExpired: vi.fn() })
    fetchMock.mockImplementationOnce(async () => {
      token = 'new' // a concurrent request refreshed while this one was in flight
      throw unauth()
    })
    fetchMock.mockResolvedValueOnce(ok({ ok: 1 }))
    expect(await useApiClient().get('/x')).toEqual({ ok: 1 })
    expect(refresh).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new')
  })

  it('never runs the refresh-and-retry path for the refresh call itself', async () => {
    const onSessionExpired = vi.fn()
    const refresh = vi.fn(async () => 'ok' as const)
    setAuthHooks({ getAccessToken: () => 'tok', refresh, onSessionExpired })
    fetchMock.mockRejectedValue(unauth())
    const err = await useApiClient().post('/auth/refresh', { refresh_token: 'r' }, { skipAuthRefresh: true, sessionEndsOn401: true }).catch((e) => e)
    expect(err).toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(refresh).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('does not expire the session nor refresh again when refresh is unavailable (network)', async () => {
    const onSessionExpired = vi.fn()
    setAuthHooks({ getAccessToken: () => 'old', refresh: vi.fn(async () => 'unavailable' as const), onSessionExpired })
    fetchMock.mockRejectedValue(unauth())
    const err = await useApiClient().get('/x').catch((e) => e)
    expect(err).toMatchObject({ code: 'NETWORK_ERROR' })
    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('skipAuthRefresh alone neither refreshes nor expires the session on 401', async () => {
    const onSessionExpired = vi.fn()
    const refresh = vi.fn(async () => 'ok' as const)
    setAuthHooks({ getAccessToken: () => 'tok', refresh, onSessionExpired })
    fetchMock.mockRejectedValue(unauth())
    await expect(useApiClient().post('/x', {}, { skipAuthRefresh: true })).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
    expect(refresh).not.toHaveBeenCalled()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('getBlob returns the raw blob with the bearer token and no envelope unwrap', async () => {
    setAuthHooks({ getAccessToken: () => 'tok', refresh: vi.fn(), onSessionExpired: vi.fn() })
    const blob = new Blob(['bin'])
    fetchMock.mockResolvedValue(blob)
    expect(await useApiClient().getBlob('/f')).toBe(blob)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET', responseType: 'blob', headers: { Authorization: 'Bearer tok' } })
  })

  it('getBlob reads a JSON error envelope delivered as a blob', async () => {
    const body = JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'missing' } })
    fetchMock.mockRejectedValue({ status: 404, data: new Blob([body]) })
    await expect(useApiClient().getBlob('/f')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('getBlob refreshes once on a 401 delivered as a blob', async () => {
    let token = 'old'
    const refresh = vi.fn(async () => { token = 'new'; return 'ok' as const })
    setAuthHooks({ getAccessToken: () => token, refresh, onSessionExpired: vi.fn() })
    const body = JSON.stringify({ success: false, error: { code: 'UNAUTHENTICATED', message: 'expired' } })
    const blob = new Blob(['bin'])
    fetchMock.mockRejectedValueOnce({ status: 401, data: new Blob([body]) }).mockResolvedValueOnce(blob)
    expect(await useApiClient().getBlob('/f')).toBe(blob)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('getBlob falls back to HTTP_<status> for a non-JSON blob error', async () => {
    fetchMock.mockRejectedValue({ status: 500, data: new Blob(['<html>']) })
    await expect(useApiClient().getBlob('/f')).rejects.toMatchObject({ code: 'HTTP_500' })
  })
})
