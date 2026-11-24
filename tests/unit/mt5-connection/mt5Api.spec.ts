import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mt5Api, toAccount, toStatus, toSyncResult } from '~/features/mt5-connection/api/mt5Api'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

const accountDto = {
  id: 'a1', account_ref: '123@srv', login: 123, server: 'srv', name: 'Jane', currency: 'USD', trade_mode: 'demo',
  company: 'Broker', linked_at: '2026-01-01T00:00:00Z', last_sync_at: null, last_sync_result: null,
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('mt5 mappers', () => {
  it('maps an account with null sync info', () => {
    expect(toAccount(accountDto as never)).toMatchObject({
      id: 'a1', accountRef: '123@srv', login: 123, tradeMode: 'demo', linkedAt: '2026-01-01T00:00:00Z',
      lastSyncAt: null, lastSyncResult: null,
    })
  })
  it('maps a sync result', () => {
    expect(toSyncResult({ created: 1, updated: 2, balance_events: 3, open_positions: 4, skipped_positions: 5 })).toEqual({
      created: 1, updated: 2, balanceEvents: 3, openPositions: 4, skippedPositions: 5,
    })
  })
  it('keeps null balance/equity/as_of when disconnected', () => {
    expect(toStatus({ connected: false, balance: null, equity: null, as_of: null, last_sync_at: null })).toEqual({
      connected: false, balance: null, equity: null, asOf: null, lastSyncAt: null,
    })
  })
  it('tolerates missing optional fields', () => {
    expect(toStatus({ connected: true } as never)).toMatchObject({ balance: null, equity: null, asOf: null })
  })
})

describe('mt5Api', () => {
  it('links, lists, reads status, syncs and unlinks', async () => {
    fetchMock.mockResolvedValueOnce(ok({ account: accountDto }))
    expect((await mt5Api.link()).login).toBe(123)
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(fetchMock.mock.calls[0][0]).toContain('/mt5/accounts/link')

    fetchMock.mockResolvedValueOnce(ok({ accounts: [accountDto] }))
    expect(await mt5Api.listAccounts()).toHaveLength(1)

    fetchMock.mockResolvedValueOnce(ok({ status: { connected: false, balance: null, equity: null, as_of: null, last_sync_at: null } }))
    expect((await mt5Api.getStatus('a1')).connected).toBe(false)
    expect(fetchMock.mock.calls[2][0]).toContain('/mt5/accounts/a1/status')

    fetchMock.mockResolvedValueOnce(ok({ result: { created: 0, updated: 0, balance_events: 0, open_positions: 0, skipped_positions: 0 } }))
    expect((await mt5Api.sync('a1')).created).toBe(0)

    fetchMock.mockResolvedValueOnce(ok({ unlinked: true }))
    await mt5Api.unlink('a1')
    expect(fetchMock.mock.calls[4][1].method).toBe('DELETE')
  })
})
