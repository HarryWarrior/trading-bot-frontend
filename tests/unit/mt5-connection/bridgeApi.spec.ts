import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/composables/useApiClient'
import { bridgeApi, EA_FILE_NAME, toBridgeAccount, toBridgePagination, toIngestToken } from '~/features/mt5-connection/api/bridge'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

const tokenDto = {
  id: 't1', name: 'Laptop', scope: 'ingest:mt5', active: true,
  created_at: '2026-11-20T10:00:00Z', last_used_at: null, revoked_at: null,
}
const accountDto = {
  account_ref: '123@Broker-Demo', login: 123, server: 'Broker-Demo', balance: 1000.5, equity: 990.25,
  terminal_build: 4000, last_heartbeat: '2026-11-25T10:00:00Z', last_deal_at: null, status: 'connected',
}
const paginationDto = { page: 1, page_size: 100, total_items: 1, total_pages: 1, has_next: false, has_prev: false }

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('bridge mappers', () => {
  it('maps a token without ever carrying a plaintext', () => {
    const token = toIngestToken(tokenDto)
    expect(token).toEqual({
      id: 't1', name: 'Laptop', scope: 'ingest:mt5', active: true,
      createdAt: '2026-11-20T10:00:00Z', lastUsedAt: null, revokedAt: null,
    })
    expect(Object.keys(token)).not.toContain('plaintext')
  })

  it('maps an account with its computed status', () => {
    expect(toBridgeAccount(accountDto)).toEqual({
      accountRef: '123@Broker-Demo', login: 123, server: 'Broker-Demo', balance: 1000.5, equity: 990.25,
      terminalBuild: 4000, lastHeartbeat: '2026-11-25T10:00:00Z', lastDealAt: null, status: 'connected',
    })
  })

  it('treats any status other than connected as disconnected', () => {
    expect(toBridgeAccount({ ...accountDto, status: 'disconnected' }).status).toBe('disconnected')
    expect(toBridgeAccount({ ...accountDto, status: 'weird' }).status).toBe('disconnected')
  })

  it('maps pagination from snake_case', () => {
    expect(toBridgePagination({ page: 2, page_size: 20, total_items: 45, total_pages: 3, has_next: true, has_prev: true }))
      .toEqual({ page: 2, pageSize: 20, totalItems: 45, totalPages: 3, hasNext: true, hasPrev: true })
  })
})

describe('bridgeApi', () => {
  it('creates a token and returns the plaintext once with the token', async () => {
    fetchMock.mockResolvedValueOnce(ok({ token: tokenDto, plaintext_token: 'secret-value' }))
    const created = await bridgeApi.createToken('Laptop')
    expect(created).toEqual({ token: toIngestToken(tokenDto), plaintext: 'secret-value' })
    expect(fetchMock.mock.calls[0][0]).toBe('/mt5-bridge/tokens')
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', body: { name: 'Laptop' } })
  })

  it('lists tokens and accounts as pages', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [tokenDto], pagination: paginationDto }))
    const tokens = await bridgeApi.listTokens()
    expect(tokens.items[0].id).toBe('t1')
    expect(tokens.pagination.totalItems).toBe(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/mt5-bridge/tokens')
    expect(fetchMock.mock.calls[0][1].query).toMatchObject({ page: 1, page_size: 100 })

    fetchMock.mockResolvedValueOnce(ok({ items: [accountDto], pagination: paginationDto }))
    const accounts = await bridgeApi.listAccounts({ page: 2, pageSize: 20 })
    expect(accounts.items[0].accountRef).toBe('123@Broker-Demo')
    expect(fetchMock.mock.calls[1][0]).toBe('/mt5-bridge/accounts')
    expect(fetchMock.mock.calls[1][1].query).toMatchObject({ page: 2, page_size: 20 })
  })

  it('revokes a token by id and returns it as revoked', async () => {
    fetchMock.mockResolvedValueOnce(ok({ token: { ...tokenDto, active: false, revoked_at: '2026-11-25T11:00:00Z' } }))
    const token = await bridgeApi.revokeToken('t/1')
    expect(token.active).toBe(false)
    expect(fetchMock.mock.calls[0][0]).toBe('/mt5-bridge/tokens/t%2F1')
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE')
  })

  it('downloads the EA as a blob with its file name', async () => {
    const blob = new Blob(['ex5'])
    fetchMock.mockResolvedValueOnce(blob)
    const file = await bridgeApi.downloadEa()
    expect(file).toEqual({ blob, fileName: EA_FILE_NAME })
    expect(EA_FILE_NAME).toBe('TradingJournalBridge.ex5')
    expect(fetchMock.mock.calls[0][0]).toBe('/mt5-bridge/ea/download')
    expect(fetchMock.mock.calls[0][1].responseType).toBe('blob')
  })

  it('surfaces the 404 NOT_FOUND envelope of a missing EA as ApiError', async () => {
    const body = JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'The EA has not been built yet' } })
    fetchMock.mockRejectedValueOnce({ status: 404, data: new Blob([body], { type: 'application/json' }) })
    const err = await bridgeApi.downloadEa().catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })
})
