import type { Trade } from '~/features/journal'

export const MAX_COMPARED = 4

export interface ComparisonStats {
  count: number
  totalNet: number
  averageNet: number
  winRate: number
  /** Average reward:risk over trades that carry a stop loss; null when none does. */
  averageRR: number | null
  averageDurationMinutes: number | null
  best: Trade
  worst: Trade
}

/** Reward:risk of one trade from its real stop loss; null when the trade has no stop loss. */
export const tradeRR = (t: Trade): number | null => {
  if (t.stopLoss === null) return null
  const risk = Math.abs(t.openPrice - t.stopLoss)
  if (risk === 0) return null
  return Math.abs(t.closePrice - t.openPrice) / risk
}

export const comparisonStats = (trades: Trade[]): ComparisonStats | null => {
  if (!trades.length) return null
  const totalNet = trades.reduce((s, t) => s + t.net, 0)
  const rrs = trades.map(tradeRR).filter((v): v is number => v !== null)
  const durations = trades.map((t) => t.durationMinutes).filter((v): v is number => v !== null)
  return {
    count: trades.length,
    totalNet,
    averageNet: totalNet / trades.length,
    winRate: (trades.filter((t) => t.net > 0).length / trades.length) * 100,
    averageRR: rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : null,
    averageDurationMinutes: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    best: trades.reduce((b, t) => (t.net > b.net ? t : b)),
    worst: trades.reduce((w, t) => (t.net < w.net ? t : w)),
  }
}

/** Toggle a trade id in the selection, capped at MAX_COMPARED. */
export const toggleSelection = (selected: string[], id: string): string[] => {
  if (selected.includes(id)) return selected.filter((s) => s !== id)
  return selected.length >= MAX_COMPARED ? selected : [...selected, id]
}
