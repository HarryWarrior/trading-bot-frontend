import { formatMoney } from '~/features/journal/composables/format'
import type { Kpi, KpiTone, Summary } from '../types'

const blank = (v: number | null | undefined): v is null | undefined => v === null || v === undefined || Number.isNaN(v)

export const formatPercent = (v: number | null | undefined): string => (blank(v) ? '—' : `${v.toFixed(2)}%`)
export const formatRatio = (v: number | null | undefined): string => (blank(v) ? '—' : v.toFixed(2))

const tone = (v: number | null | undefined): KpiTone => {
  if (blank(v) || Number(Math.abs(v).toFixed(2)) === 0) return 'neutral'
  return v > 0 ? 'positive' : 'negative'
}

/** KPI cards from the summary. Unknown (null) metrics render as "—", never as zero. */
export const buildKpis = (s: Summary): Kpi[] => {
  const drawdown = s.maxDrawdown === 0 ? 0 : -Math.abs(s.maxDrawdown)
  return [
    { key: 'net_profit', value: formatMoney(s.netProfit), tone: tone(s.netProfit), tooltipKey: 'analytics.kpi.net_profit_tip' },
    { key: 'win_rate', value: formatPercent(s.winRate), subtitle: `${s.wins} / ${s.totalTrades}`, tone: 'neutral', tooltipKey: 'tooltip.win_rate' },
    { key: 'profit_factor', value: formatRatio(s.profitFactor), tone: 'neutral', tooltipKey: 'tooltip.profit_factor' },
    { key: 'payoff_ratio', value: formatRatio(s.payoffRatio), tone: 'neutral', tooltipKey: 'tooltip.payoff_ratio' },
    { key: 'average_trade', value: formatMoney(s.averageTrade), tone: tone(s.averageTrade), tooltipKey: 'analytics.kpi.average_trade_tip' },
    {
      key: 'max_drawdown',
      value: formatMoney(drawdown),
      subtitle: formatPercent(s.maxDrawdownPct),
      tone: tone(drawdown),
      tooltipKey: s.maxDrawdownPct === null ? 'analytics.kpi.drawdown_pct_unavailable' : 'analytics.kpi.max_drawdown_tip',
    },
    { key: 'total_trades', value: String(s.totalTrades), tone: 'neutral', tooltipKey: 'analytics.kpi.total_trades_tip' },
    { key: 'win_streak', value: String(s.longestWinStreak), subtitle: String(s.longestLossStreak), tone: 'neutral', tooltipKey: 'tooltip.streak' },
  ]
}
