import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyticsApi, toDay, toEquityPoint, toHour, toSummary, toSymbol } from '~/features/analytics/api/analyticsApi'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

const summaryDto = {
  total_trades: 2, wins: 1, losses: 1, breakeven: 0, win_rate: 50, gross_profit: 10, gross_loss: -4, net_profit: 6,
  profit_factor: 2.5, payoff_ratio: 1.2, average_trade: 3, max_drawdown: 4, max_drawdown_pct: 0.4,
  longest_win_streak: 1, longest_loss_streak: 1, best_day: '2026-01-01', best_day_net: 10, worst_day: '2026-01-02',
  worst_day_net: -4, starting_balance: 1000, ending_balance: 1006,
}

describe('analytics mappers', () => {
  it('maps the summary to camelCase', () => {
    expect(toSummary(summaryDto)).toMatchObject({
      totalTrades: 2, winRate: 50, grossProfit: 10, netProfit: 6, profitFactor: 2.5, maxDrawdownPct: 0.4,
      longestWinStreak: 1, bestDay: '2026-01-01', bestDayNet: 10, startingBalance: 1000, endingBalance: 1006,
    })
  })

  it('keeps unknown metrics as null (never 0)', () => {
    const s = toSummary({
      ...summaryDto, profit_factor: null, payoff_ratio: null, average_trade: null, max_drawdown_pct: null,
      best_day: null, best_day_net: null, worst_day: null, worst_day_net: null, starting_balance: null, ending_balance: null,
    })
    expect(s.profitFactor).toBeNull()
    expect(s.payoffRatio).toBeNull()
    expect(s.averageTrade).toBeNull()
    expect(s.maxDrawdownPct).toBeNull()
    expect(s.bestDay).toBeNull()
    expect(s.worstDayNet).toBeNull()
    expect(s.startingBalance).toBeNull()
    expect(s.endingBalance).toBeNull()
  })

  it('maps series rows', () => {
    expect(toEquityPoint({ time: 't', equity: 5 })).toEqual({ time: 't', equity: 5 })
    expect(toDay({ day: '2026-01-01', trades: 2, net: 3 })).toEqual({ day: '2026-01-01', trades: 2, net: 3 })
    expect(toSymbol({ symbol: 'EURUSD', trades: 3, wins: 2, win_rate: 66.67, net: 9 })).toEqual({
      symbol: 'EURUSD', trades: 3, wins: 2, winRate: 66.67, net: 9,
    })
    expect(toHour({ hour: 9, trades: 1, net: -2 })).toEqual({ hour: 9, trades: 1, net: -2 })
  })
})

describe('analyticsApi', () => {
  it('calls the endpoints and unwraps the envelope', async () => {
    fetchMock.mockResolvedValueOnce(ok({ summary: summaryDto }))
    const s = await analyticsApi.summary()
    expect(s.totalTrades).toBe(2)
    expect(fetchMock.mock.calls[0][0]).toBe('/analytics/summary')
    expect(fetchMock.mock.calls[0][1].query).toBeUndefined()
  })

  it('passes account_ref only when set', async () => {
    fetchMock.mockResolvedValueOnce(ok({ points: [{ time: 't', equity: 1 }] }))
    expect(await analyticsApi.equity('acc-1')).toEqual([{ time: 't', equity: 1 }])
    expect(fetchMock.mock.calls[0][0]).toBe('/analytics/equity')
    expect(fetchMock.mock.calls[0][1].query).toEqual({ account_ref: 'acc-1' })
  })

  it('lists daily, by-symbol and hourly rows', async () => {
    fetchMock.mockResolvedValueOnce(ok({ days: [{ day: '2026-01-01', trades: 1, net: 1 }] }))
    fetchMock.mockResolvedValueOnce(ok({ symbols: [{ symbol: 'X', trades: 1, wins: 1, win_rate: 100, net: 1 }] }))
    fetchMock.mockResolvedValueOnce(ok({ hours: [{ hour: 1, trades: 1, net: 1 }] }))
    expect(await analyticsApi.daily()).toHaveLength(1)
    expect((await analyticsApi.bySymbol())[0].winRate).toBe(100)
    expect((await analyticsApi.hourly())[0].hour).toBe(1)
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(['/analytics/daily', '/analytics/by-symbol', '/analytics/hourly'])
  })
})
