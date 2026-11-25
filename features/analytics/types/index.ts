export interface Summary {
  totalTrades: number
  wins: number
  losses: number
  breakeven: number
  winRate: number
  grossProfit: number
  grossLoss: number
  netProfit: number
  profitFactor: number | null
  payoffRatio: number | null
  averageTrade: number | null
  maxDrawdown: number
  maxDrawdownPct: number | null
  longestWinStreak: number
  longestLossStreak: number
  bestDay: string | null
  bestDayNet: number | null
  worstDay: string | null
  worstDayNet: number | null
  startingBalance: number | null
  endingBalance: number | null
}

export interface EquityPoint { time: string; equity: number }
export interface DayStat { day: string; trades: number; net: number }
export interface SymbolStat { symbol: string; trades: number; wins: number; winRate: number; net: number }
export interface HourStat { hour: number; trades: number; net: number }

export type KpiTone = 'positive' | 'negative' | 'neutral'
export interface Kpi {
  key: string
  value: string
  subtitle?: string
  tone: KpiTone
  tooltipKey: string
}
