import { describe, expect, it } from 'vitest'
import { comparisonStats, toggleSelection, tradeRR } from '~/features/analytics/composables/comparison'
import type { Trade } from '~/features/journal'

const trade = (over: Partial<Trade>): Trade => ({
  id: 'a', accountRef: 'x', positionId: 'p', symbol: 'EURUSD', side: 'buy', volume: 1, openTime: '', closeTime: '',
  openPrice: 1, closePrice: 1.2, stopLoss: null, takeProfit: null, commission: 0, swap: 0, profit: 0, net: 10,
  outcome: 'win', durationMinutes: 30, comment: null, source: 'upload', importId: null, ...over,
})

describe('trade comparison', () => {
  it('computes RR only from a real stop loss', () => {
    expect(tradeRR(trade({ stopLoss: null }))).toBeNull()
    expect(tradeRR(trade({ stopLoss: 0.9 }))).toBeCloseTo(2)
  })

  it('aggregates stats without inventing RR', () => {
    const s = comparisonStats([trade({ id: 'a', net: 10 }), trade({ id: 'b', net: -4, durationMinutes: null })])!
    expect(s).toMatchObject({ count: 2, totalNet: 6, averageNet: 3, winRate: 50, averageRR: null, averageDurationMinutes: 30 })
    expect(s.best.id).toBe('a')
    expect(s.worst.id).toBe('b')
    expect(comparisonStats([])).toBeNull()
  })

  it('caps the selection at 4', () => {
    let sel: string[] = []
    for (const id of ['1', '2', '3', '4', '5']) sel = toggleSelection(sel, id)
    expect(sel).toEqual(['1', '2', '3', '4'])
    expect(toggleSelection(sel, '2')).toEqual(['1', '3', '4'])
  })
})
