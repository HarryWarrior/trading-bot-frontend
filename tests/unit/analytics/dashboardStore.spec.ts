import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '~/composables/useApiClient'

vi.mock('~/features/analytics/api/analyticsApi', () => ({
  analyticsApi: { summary: vi.fn(), equity: vi.fn(), daily: vi.fn(), bySymbol: vi.fn(), hourly: vi.fn() },
}))

import { analyticsApi } from '~/features/analytics/api/analyticsApi'
import { useAnalyticsDashboardStore } from '~/features/analytics/stores/analyticsDashboard'

const api = analyticsApi as unknown as Record<'summary' | 'equity' | 'daily' | 'bySymbol' | 'hourly', ReturnType<typeof vi.fn>>
const summary = { totalTrades: 3 }

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(api).forEach((fn) => fn.mockReset())
})

const resolveAll = () => {
  api.summary.mockResolvedValue(summary)
  api.equity.mockResolvedValue([{ time: 't', equity: 1 }])
  api.daily.mockResolvedValue([])
  api.bySymbol.mockResolvedValue([])
  api.hourly.mockResolvedValue([])
}

describe('analytics dashboard store', () => {
  it('loads every section for the selected account', async () => {
    resolveAll()
    const store = useAnalyticsDashboardStore()
    await store.load('acc-1')
    expect(api.summary).toHaveBeenCalledWith('acc-1')
    expect(store.summary).toEqual(summary)
    expect(store.equity).toHaveLength(1)
    expect(store.error).toBeNull()
    expect(store.hasData).toBe(true)
  })

  it('exposes JOURNAL_UNAVAILABLE on 503 and clears data (no zeros, no stale numbers)', async () => {
    resolveAll()
    const store = useAnalyticsDashboardStore()
    await store.load(null)
    api.summary.mockRejectedValue(new ApiError('JOURNAL_UNAVAILABLE', 'down', 503))
    await store.load(null)
    expect(store.error).toBe('JOURNAL_UNAVAILABLE')
    expect(store.summary).toBeNull()
    expect(store.equity).toEqual([])
    expect(store.hasData).toBe(false)
  })

  it('maps non-API failures to UNKNOWN', async () => {
    resolveAll()
    api.equity.mockRejectedValue(new Error('boom'))
    const store = useAnalyticsDashboardStore()
    await store.load(null)
    expect(store.error).toBe('UNKNOWN')
    expect(store.summary).toBeNull()
  })

  it('treats zero trades as empty, not as an error', async () => {
    resolveAll()
    api.summary.mockResolvedValue({ totalTrades: 0 })
    const store = useAnalyticsDashboardStore()
    await store.load(null)
    expect(store.error).toBeNull()
    expect(store.isEmpty).toBe(true)
  })

  it('ignores a stale response when the account changed meanwhile', async () => {
    let release!: (v: unknown) => void
    resolveAll()
    api.summary.mockImplementationOnce(() => new Promise((r) => { release = r }))
    const store = useAnalyticsDashboardStore()
    const first = store.load('a')
    api.summary.mockResolvedValue({ totalTrades: 9 })
    await store.load('b')
    release({ totalTrades: 1 })
    await first
    expect(store.summary).toEqual({ totalTrades: 9 })
  })
})
