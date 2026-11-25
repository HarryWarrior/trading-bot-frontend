import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '~/composables/useApiClient'

vi.mock('~/features/journal/api/journalApi', () => ({
  journalApi: { uploadReport: vi.fn(), listTrades: vi.fn(), listAccounts: vi.fn(), getTrade: vi.fn() },
}))

import { journalApi } from '~/features/journal/api/journalApi'
import { useJournalTradesStore } from '~/features/journal/stores/journalTrades'
import { useJournalImportStore } from '~/features/journal/stores/journalImport'
import { useJournalAccountsStore } from '~/features/journal/stores/journalAccounts'

const api = journalApi as unknown as Record<'uploadReport' | 'listTrades' | 'listAccounts', ReturnType<typeof vi.fn>>
const pagination = { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false }

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(api).forEach((fn) => fn.mockReset())
})

describe('journal trades store', () => {
  it('loads with default pagination and sort', async () => {
    api.listTrades.mockResolvedValue({ items: [{ id: 't1' }], pagination })
    const store = useJournalTradesStore()
    await store.load()
    expect(api.listTrades).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20, sortBy: 'close_time', sortDir: 'desc' }))
    expect(store.trades).toHaveLength(1)
  })

  it('changing a filter resets to page 1 and passes the filters', async () => {
    api.listTrades.mockResolvedValue({ items: [], pagination })
    const store = useJournalTradesStore()
    await store.setPage(3)
    await store.setFilters({ symbol: 'EURUSD', outcome: 'loss', accountRef: 'upload' })
    const query = api.listTrades.mock.calls.at(-1)![0]
    expect(query).toMatchObject({ page: 1, symbol: 'EURUSD', outcome: 'loss', accountRef: 'upload' })
    expect(store.hasFilters).toBe(true)
  })

  it('page size change resets to page 1; sort toggles direction on the same column', async () => {
    api.listTrades.mockResolvedValue({ items: [], pagination })
    const store = useJournalTradesStore()
    await store.setPage(2)
    await store.setPageSize(50)
    expect(api.listTrades.mock.calls.at(-1)![0]).toMatchObject({ page: 1, pageSize: 50 })
    await store.setSort('profit')
    expect(api.listTrades.mock.calls.at(-1)![0]).toMatchObject({ sortBy: 'profit', sortDir: 'desc' })
    await store.setSort('profit')
    expect(api.listTrades.mock.calls.at(-1)![0]).toMatchObject({ sortBy: 'profit', sortDir: 'asc' })
  })

  it('on failure shows the error code and no stale rows', async () => {
    const store = useJournalTradesStore()
    api.listTrades.mockResolvedValueOnce({ items: [{ id: 't1' }], pagination })
    await store.load()
    api.listTrades.mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 'x', 0))
    await store.load()
    expect(store.error).toBe('NETWORK_ERROR')
    expect(store.trades).toEqual([])
  })

  it('rejects from > to without a request and exposes the error', async () => {
    api.listTrades.mockResolvedValue({ items: [], pagination })
    const store = useJournalTradesStore()
    await store.setFilters({ dateFrom: '2026-02-01', dateTo: '2026-01-01' })
    expect(api.listTrades).not.toHaveBeenCalled()
    expect(store.rangeError).toBe(true)
    await store.setFilters({ dateTo: '2026-02-05' })
    expect(store.rangeError).toBe(false)
    expect(api.listTrades).toHaveBeenCalledTimes(1)
  })

  it('resetFilters clears filters', async () => {
    api.listTrades.mockResolvedValue({ items: [], pagination })
    const store = useJournalTradesStore()
    await store.setFilters({ symbol: 'X' })
    await store.resetFilters()
    expect(store.hasFilters).toBe(false)
  })
})

describe('journal import store', () => {
  const csv = (name = 'r.csv', size = 10) => ({ name, size }) as File

  it('stores the import result on success', async () => {
    api.uploadReport.mockResolvedValue({ id: 'i1', tradesCreated: 2, skippedRows: [] })
    const store = useJournalImportStore()
    expect(await store.upload(csv())).toBe(true)
    expect(store.result?.id).toBe('i1')
  })

  it('validates client-side without calling the api', async () => {
    const store = useJournalImportStore()
    expect(await store.upload(csv('r.pdf'))).toBe(false)
    expect(store.error).toBe('UNSUPPORTED_FILE')
    expect(api.uploadReport).not.toHaveBeenCalled()
  })

  it('refreshes accounts after a successful import, and trades only if already loaded', async () => {
    api.uploadReport.mockResolvedValue({ id: 'i1', tradesCreated: 2, skippedRows: [] })
    api.listAccounts.mockResolvedValue([])
    api.listTrades.mockResolvedValue({ items: [], pagination })
    const store = useJournalImportStore()
    await store.upload(csv())
    expect(api.listAccounts).toHaveBeenCalledTimes(1)
    expect(api.listTrades).not.toHaveBeenCalled()
    await useJournalTradesStore().load()
    api.listTrades.mockClear()
    api.uploadReport.mockResolvedValue({ id: 'i2', tradesCreated: 1, skippedRows: [] })
    await store.upload(csv())
    expect(api.listTrades).toHaveBeenCalledTimes(1)
  })

  it('does not refresh on failure', async () => {
    api.uploadReport.mockRejectedValue(new ApiError('DUPLICATE_IMPORT', 'dup', 409, {}))
    await useJournalImportStore().upload(csv())
    expect(api.listAccounts).not.toHaveBeenCalled()
  })

  it('keeps the duplicate import id from a 409', async () => {
    api.uploadReport.mockRejectedValue(new ApiError('DUPLICATE_IMPORT', 'dup', 409, { import_id: 'i0' }))
    const store = useJournalImportStore()
    expect(await store.upload(csv())).toBe(false)
    expect(store.error).toBe('DUPLICATE_IMPORT')
    expect(store.duplicateImportId).toBe('i0')
  })

  it('keeps the unreadable reason', async () => {
    api.uploadReport.mockRejectedValue(new ApiError('UNREADABLE_REPORT', 'u', 400, { reason: 'no header' }))
    const store = useJournalImportStore()
    await store.upload(csv())
    expect(store.errorReason).toBe('no header')
  })
})

describe('journal accounts store', () => {
  it('loads accounts and surfaces errors', async () => {
    api.listAccounts.mockResolvedValueOnce([{ accountRef: 'upload', trades: 1 }])
    const store = useJournalAccountsStore()
    await store.load()
    expect(store.accounts).toHaveLength(1)
    api.listAccounts.mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 'x', 0))
    await store.load()
    expect(store.error).toBe('NETWORK_ERROR')
    expect(store.accounts).toEqual([])
  })
})
