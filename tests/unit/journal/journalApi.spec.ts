import { beforeEach, describe, expect, it, vi } from 'vitest'
import { journalApi, toAccount, toImport, toPagination, toTrade } from '~/features/journal/api/journalApi'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

const tradeDto = {
  id: 't1', account_ref: 'upload', position_id: 'p1', symbol: 'EURUSD', side: 'buy', volume: 0.1,
  open_time: '2026-01-01T10:00:00Z', close_time: '2026-01-01T11:00:00Z', open_price: 1.1, close_price: 1.2,
  stop_loss: null, take_profit: 1.3, commission: -0.5, swap: 0, profit: 10, net: 9.5, outcome: 'WIN',
  duration_minutes: 60, comment: null, source: 'upload', import_id: 'i1',
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('journal mappers', () => {
  it('maps a trade DTO to camelCase', () => {
    expect(toTrade(tradeDto as never)).toMatchObject({
      id: 't1', accountRef: 'upload', positionId: 'p1', openTime: '2026-01-01T10:00:00Z', stopLoss: null,
      takeProfit: 1.3, durationMinutes: 60, importId: 'i1', net: 9.5, outcome: 'WIN',
    })
  })

  it('maps an import DTO including skipped rows', () => {
    expect(
      toImport({
        id: 'i1', filename: 'r.csv', account_ref: 'upload', trades_created: 3, trades_updated: 1, balance_events: 2,
        skipped_rows: [{ row: 7, reason: 'bad date' }], created_at: 'c',
      }),
    ).toEqual({
      id: 'i1', filename: 'r.csv', accountRef: 'upload', tradesCreated: 3, tradesUpdated: 1, balanceEvents: 2,
      skippedRows: [{ row: 7, reason: 'bad date' }], createdAt: 'c',
    })
  })

  it('maps pagination and accounts', () => {
    expect(toPagination({ page: 2, page_size: 20, total_items: 45, total_pages: 3, has_next: true, has_prev: true })).toEqual({
      page: 2, pageSize: 20, totalItems: 45, totalPages: 3, hasNext: true, hasPrev: true,
    })
    expect(toAccount({ account_ref: 'upload', trades: 4, first_trade_at: 'a', last_trade_at: null })).toEqual({
      accountRef: 'upload', trades: 4, firstTradeAt: 'a', lastTradeAt: null,
    })
  })
})

describe('journalApi', () => {
  it('uploads the file as multipart under "file"', async () => {
    fetchMock.mockResolvedValue(ok({ import: { id: 'i1', filename: 'r.csv', account_ref: 'upload', trades_created: 1, trades_updated: 0, balance_events: 0, skipped_rows: [], created_at: 'c' } }))
    const file = new File(['a,b'], 'r.csv', { type: 'text/csv' })
    const result = await journalApi.uploadReport(file)
    const [path, options] = fetchMock.mock.calls[0]
    expect(path).toBe('/journal/imports')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('file')).toBeInstanceOf(File)
    expect(result.tradesCreated).toBe(1)
  })

  it('lists trades with built query params', async () => {
    fetchMock.mockResolvedValue(ok({
      items: [tradeDto],
      pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1, has_next: false, has_prev: false },
    }))
    const page = await journalApi.listTrades({ symbol: 'EURUSD', outcome: 'WIN' })
    expect(fetchMock.mock.calls[0][0]).toBe('/journal/trades')
    expect(fetchMock.mock.calls[0][1].query).toEqual({ page: 1, page_size: 20, symbol: 'EURUSD', outcome: 'WIN' })
    expect(page.items[0].accountRef).toBe('upload')
    expect(page.pagination.totalItems).toBe(1)
  })

  it('lists accounts', async () => {
    fetchMock.mockResolvedValue(ok([{ account_ref: 'upload', trades: 2, first_trade_at: null, last_trade_at: null }]))
    expect(await journalApi.listAccounts()).toEqual([{ accountRef: 'upload', trades: 2, firstTradeAt: null, lastTradeAt: null }])
  })
})
