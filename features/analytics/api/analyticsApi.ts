import { useApiClient } from '~/composables/useApiClient'
import type { DayStat, EquityPoint, HourStat, SymbolStat, Summary } from '../types'

/** Backend DTOs (snake_case). Mapping to view types happens only in this file. */
interface SummaryDto {
  total_trades: number
  wins: number
  losses: number
  breakeven: number
  win_rate: number
  gross_profit: number
  gross_loss: number
  net_profit: number
  profit_factor: number | null
  payoff_ratio: number | null
  average_trade: number | null
  max_drawdown: number
  max_drawdown_pct: number | null
  longest_win_streak: number
  longest_loss_streak: number
  best_day: string | null
  best_day_net: number | null
  worst_day: string | null
  worst_day_net: number | null
  starting_balance: number | null
  ending_balance: number | null
}
interface SymbolDto { symbol: string; trades: number; wins: number; win_rate: number; net: number }

const orNull = <T>(v: T | null | undefined): T | null => v ?? null

export const toSummary = (d: SummaryDto): Summary => ({
  totalTrades: d.total_trades,
  wins: d.wins,
  losses: d.losses,
  breakeven: d.breakeven,
  winRate: d.win_rate,
  grossProfit: d.gross_profit,
  grossLoss: d.gross_loss,
  netProfit: d.net_profit,
  profitFactor: orNull(d.profit_factor),
  payoffRatio: orNull(d.payoff_ratio),
  averageTrade: orNull(d.average_trade),
  maxDrawdown: d.max_drawdown,
  maxDrawdownPct: orNull(d.max_drawdown_pct),
  longestWinStreak: d.longest_win_streak,
  longestLossStreak: d.longest_loss_streak,
  bestDay: orNull(d.best_day),
  bestDayNet: orNull(d.best_day_net),
  worstDay: orNull(d.worst_day),
  worstDayNet: orNull(d.worst_day_net),
  startingBalance: orNull(d.starting_balance),
  endingBalance: orNull(d.ending_balance),
})

export const toEquityPoint = (d: { time: string; equity: number }): EquityPoint => ({ time: d.time, equity: d.equity })
export const toDay = (d: { day: string; trades: number; net: number }): DayStat => ({ day: d.day, trades: d.trades, net: d.net })
export const toSymbol = (d: SymbolDto): SymbolStat => ({ symbol: d.symbol, trades: d.trades, wins: d.wins, winRate: d.win_rate, net: d.net })
export const toHour = (d: { hour: number; trades: number; net: number }): HourStat => ({ hour: d.hour, trades: d.trades, net: d.net })

const q = (accountRef?: string | null) => (accountRef ? { account_ref: accountRef } : undefined)

export const analyticsApi = {
  async summary(accountRef?: string | null): Promise<Summary> {
    const data = await useApiClient().get<{ summary: SummaryDto }>('/analytics/summary', q(accountRef))
    return toSummary(data.summary)
  },
  async equity(accountRef?: string | null): Promise<EquityPoint[]> {
    const data = await useApiClient().get<{ points: Array<{ time: string; equity: number }> }>('/analytics/equity', q(accountRef))
    return data.points.map(toEquityPoint)
  },
  async daily(accountRef?: string | null): Promise<DayStat[]> {
    const data = await useApiClient().get<{ days: Array<{ day: string; trades: number; net: number }> }>('/analytics/daily', q(accountRef))
    return data.days.map(toDay)
  },
  async bySymbol(accountRef?: string | null): Promise<SymbolStat[]> {
    const data = await useApiClient().get<{ symbols: SymbolDto[] }>('/analytics/by-symbol', q(accountRef))
    return data.symbols.map(toSymbol)
  },
  async hourly(accountRef?: string | null): Promise<HourStat[]> {
    const data = await useApiClient().get<{ hours: Array<{ hour: number; trades: number; net: number }> }>('/analytics/hourly', q(accountRef))
    return data.hours.map(toHour)
  },
}
