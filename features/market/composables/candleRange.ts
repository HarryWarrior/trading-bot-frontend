import type { Candle } from '../types'

/** The candle whose interval contains `time` (greatest start <= time); null when `time` precedes the first candle. */
export const candleContaining = (candles: Candle[], time: number): Candle | null => {
  let found: Candle | null = null
  for (const c of candles) {
    if (c.time <= time) found = c
    else break
  }
  return found
}

/** True when the trade opens inside the loaded range (the last candle spans one step past its start). */
export const isWithinCandles = (candles: Candle[], openTime: number, closeTime: number): boolean => {
  if (!candles.length) return false
  const first = candles[0].time
  const last = candles[candles.length - 1].time
  const step = candles.length > 1 ? last - candles[candles.length - 2].time : 0
  return openTime >= first && openTime < last + step && closeTime >= first
}
