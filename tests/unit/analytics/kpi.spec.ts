import { describe, expect, it } from 'vitest'
import { buildKpis, formatPercent, formatRatio } from '~/features/analytics/composables/kpi'
import type { Summary } from '~/features/analytics/types'

const summary = (over: Partial<Summary> = {}): Summary => ({
  totalTrades: 10, wins: 6, losses: 3, breakeven: 1, winRate: 60, grossProfit: 300, grossLoss: -100, netProfit: 200,
  profitFactor: 3, payoffRatio: 1.5, averageTrade: 20, maxDrawdown: 50, maxDrawdownPct: 5.5,
  longestWinStreak: 4, longestLossStreak: 2, bestDay: '2026-01-02', bestDayNet: 80, worstDay: '2026-01-03', worstDayNet: -30,
  startingBalance: 1000, endingBalance: 1200, ...over,
})
const byKey = (kpis: ReturnType<typeof buildKpis>, key: string) => kpis.find((k) => k.key === key)!

describe('KPI formatting', () => {
  it('formats percent and ratio to 2 dp and null to a dash', () => {
    expect(formatPercent(60)).toBe('60.00%')
    expect(formatPercent(5.556)).toBe('5.56%')
    expect(formatPercent(null)).toBe('—')
    expect(formatRatio(1.5)).toBe('1.50')
    expect(formatRatio(null)).toBe('—')
  })

  it('shows money with sign and tone', () => {
    expect(byKey(buildKpis(summary({ netProfit: -12.3 })), 'net_profit')).toMatchObject({ value: '−12.30', tone: 'negative' })
    expect(byKey(buildKpis(summary()), 'net_profit')).toMatchObject({ value: '+200.00', tone: 'positive' })
  })

  it('renders null metrics as a dash, never zero', () => {
    const kpis = buildKpis(summary({ profitFactor: null, payoffRatio: null, averageTrade: null, maxDrawdownPct: null }))
    expect(byKey(kpis, 'profit_factor').value).toBe('—')
    expect(byKey(kpis, 'payoff_ratio').value).toBe('—')
    expect(byKey(kpis, 'average_trade').value).toBe('—')
  })

  it('shows drawdown percent as a dash with an explanation when null', () => {
    const dd = byKey(buildKpis(summary({ maxDrawdownPct: null })), 'max_drawdown')
    expect(dd.subtitle).toBe('—')
    expect(dd.tooltipKey).toBe('analytics.kpi.drawdown_pct_unavailable')
    const ok = byKey(buildKpis(summary()), 'max_drawdown')
    expect(ok.subtitle).toBe('5.50%')
    expect(ok.tooltipKey).toBe('analytics.kpi.max_drawdown_tip')
    expect(ok.value).toBe('−50.00')
  })

  it('shows win rate with counts', () => {
    const wr = byKey(buildKpis(summary()), 'win_rate')
    expect(wr.value).toBe('60.00%')
    expect(wr.subtitle).toBe('6 / 10')
  })
})
