import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '~/composables/useApiClient'
import { getAuthHooks, resetAuthHooks } from '~/composables/apiAuth'

vi.mock('~/features/auth/api/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    refresh: vi.fn(),
    signOut: vi.fn(),
    me: vi.fn(),
  },
}))

import { authApi } from '~/features/auth/api/authApi'
import { useAuthStore } from '~/features/auth/stores/auth'

const api = authApi as unknown as Record<'signIn' | 'refresh' | 'signOut' | 'me', ReturnType<typeof vi.fn>>

const user = { id: 'u1', email: 'a@b.com', name: 'Ann', role: 'user', emailVerified: true, createdAt: 't' }
const session = (access: string, refresh: string) => ({
  accessToken: access,
  refreshToken: refresh,
  tokenType: 'bearer',
  expiresIn: 900,
  user,
})

/** Node 25 ships its own (inert) localStorage that shadows happy-dom's; use a plain in-memory one. */
const memoryStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    toJSON: () => Object.fromEntries(data),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
  setActivePinia(createPinia())
  resetAuthHooks()
  Object.values(api).forEach((fn) => fn.mockReset())
})

describe('auth store', () => {
  it('signIn keeps the access token in memory and the refresh token in localStorage', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    const store = useAuthStore()
    await store.signIn('a@b.com', 'secret123')
    expect(store.accessToken).toBe('acc1')
    expect(store.user?.email).toBe('a@b.com')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('tb.refresh')).toBe('ref1')
    expect(JSON.stringify(localStorage)).not.toContain('acc1')
  })

  it('signIn failure stores the error code and persists nothing', async () => {
    api.signIn.mockRejectedValue(new ApiError('INVALID_CREDENTIALS', 'bad', 401))
    const store = useAuthStore()
    await expect(store.signIn('a@b.com', 'x')).rejects.toBeInstanceOf(ApiError)
    expect(store.error).toBe('INVALID_CREDENTIALS')
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('tb.refresh')).toBeNull()
  })

  it('refresh rotates the stored refresh token', async () => {
    localStorage.setItem('tb.refresh', 'ref1')
    api.refresh.mockResolvedValue(session('acc2', 'ref2'))
    const store = useAuthStore()
    expect(await store.refresh()).toBe('ok')
    expect(api.refresh).toHaveBeenCalledWith('ref1')
    expect(localStorage.getItem('tb.refresh')).toBe('ref2')
    expect(store.accessToken).toBe('acc2')
  })

  it('refresh without a stored token resolves false', async () => {
    expect(await useAuthStore().refresh()).toBe('expired')
    expect(api.refresh).not.toHaveBeenCalled()
  })

  it('a rejected refresh (401) clears the session', async () => {
    localStorage.setItem('tb.refresh', 'bad')
    api.refresh.mockRejectedValue(new ApiError('INVALID_TOKEN', 'x', 401))
    const store = useAuthStore()
    expect(await store.refresh()).toBe('expired')
    expect(localStorage.getItem('tb.refresh')).toBeNull()
    expect(store.accessToken).toBeNull()
  })

  it('a network failure during refresh keeps the stored token', async () => {
    localStorage.setItem('tb.refresh', 'ref1')
    api.refresh.mockRejectedValue(new ApiError('NETWORK_ERROR', 'x', 0))
    expect(await useAuthStore().refresh()).toBe('unavailable')
    expect(localStorage.getItem('tb.refresh')).toBe('ref1')
  })

  it('concurrent refreshes share one request', async () => {
    localStorage.setItem('tb.refresh', 'ref1')
    api.refresh.mockResolvedValue(session('acc2', 'ref2'))
    const store = useAuthStore()
    await Promise.all([store.refresh(), store.refresh()])
    expect(api.refresh).toHaveBeenCalledTimes(1)
  })

  it('signOut clears memory and storage even if the server call fails', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    api.signOut.mockRejectedValue(new ApiError('NETWORK_ERROR', 'x', 0))
    const store = useAuthStore()
    await store.signIn('a@b.com', 'secret123')
    await store.signOut()
    expect(api.signOut).toHaveBeenCalledWith('ref1')
    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('tb.refresh')).toBeNull()
  })

  it('restore without a stored token finishes signed out', async () => {
    const store = useAuthStore()
    await store.restore()
    expect(store.ready).toBe(true)
    expect(store.isAuthenticated).toBe(false)
  })

  it('restore refreshes then loads me', async () => {
    localStorage.setItem('tb.refresh', 'ref1')
    api.refresh.mockResolvedValue(session('acc2', 'ref2'))
    api.me.mockResolvedValue({ ...user, name: 'Ann Fresh' })
    const store = useAuthStore()
    await store.restore()
    expect(store.ready).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.name).toBe('Ann Fresh')
  })

  it('restore runs once', async () => {
    const store = useAuthStore()
    await store.restore()
    localStorage.setItem('tb.refresh', 'ref1')
    await store.restore()
    expect(api.refresh).not.toHaveBeenCalled()
  })

  it('registers API hooks that expose the token, refresh and expire the session', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    const onExpired = vi.fn()
    const store = useAuthStore()
    store.registerHooks(onExpired)
    await store.signIn('a@b.com', 'secret123')
    const hooks = getAuthHooks()
    expect(hooks?.getAccessToken()).toBe('acc1')
    hooks?.onSessionExpired()
    expect(store.accessToken).toBeNull()
    expect(localStorage.getItem('tb.refresh')).toBeNull()
    expect(onExpired).toHaveBeenCalled()
  })

  it('keeps the session and refresh token when refresh fails on the network mid-session, even through the hooks', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    api.refresh.mockRejectedValue(new ApiError('NETWORK_ERROR', 'x', 0))
    const onExpired = vi.fn()
    const store = useAuthStore()
    store.registerHooks(onExpired)
    await store.signIn('a@b.com', 'secret123')
    expect(await getAuthHooks()?.refresh()).toBe('unavailable')
    expect(localStorage.getItem('tb.refresh')).toBe('ref1')
    expect(store.isAuthenticated).toBe(true)
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('signOut retries once with the rotated refresh token when the access token expired', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    api.signOut.mockRejectedValueOnce(new ApiError('UNAUTHENTICATED', 'expired', 401)).mockResolvedValueOnce(undefined)
    api.refresh.mockResolvedValue(session('acc2', 'ref2'))
    const store = useAuthStore()
    await store.signIn('a@b.com', 'secret123')
    await store.signOut()
    expect(api.signOut).toHaveBeenNthCalledWith(1, 'ref1')
    expect(api.signOut).toHaveBeenNthCalledWith(2, 'ref2')
    expect(store.accessToken).toBeNull()
    expect(localStorage.getItem('tb.refresh')).toBeNull()
  })

  it('signOut clears locally even if the retry also fails', async () => {
    api.signIn.mockResolvedValue(session('acc1', 'ref1'))
    api.signOut.mockRejectedValue(new ApiError('UNAUTHENTICATED', 'expired', 401))
    api.refresh.mockResolvedValue(session('acc2', 'ref2'))
    const store = useAuthStore()
    await store.signIn('a@b.com', 'secret123')
    await store.signOut()
    expect(api.signOut).toHaveBeenCalledTimes(2)
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('tb.refresh')).toBeNull()
  })
})
