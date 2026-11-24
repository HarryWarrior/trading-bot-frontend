import { describe, expect, it } from 'vitest'
import { candleContaining, isWithinCandles } from '~/features/market/composables/candleRange'

const c = (time: number) => ({ time, open: 1, high: 1, low: 1, close: 1, tickVolume: 0 })
const candles = [c(1000), c(1300), c(1600)] // M5

describe('candle range', () => {
  it('finds the candle containing a time (floor), not the nearest', () => {
    expect(candleContaining(candles, 1299)!.time).toBe(1000)
    expect(candleContaining(candles, 1300)!.time).toBe(1300)
    expect(candleContaining(candles, 1599)!.time).toBe(1300)
  })
  it('returns null before the first candle', () => {
    expect(candleContaining(candles, 999)).toBeNull()
  })
  it('is out of range when the open is before the first candle or after the last', () => {
    expect(isWithinCandles(candles, 999, 1700)).toBe(false)
    expect(isWithinCandles(candles, 1100, 1700)).toBe(true)
    expect(isWithinCandles(candles, 1700, 1800)).toBe(true)
  })
  it('is empty-safe', () => {
    expect(isWithinCandles([], 1, 2)).toBe(false)
  })
})
