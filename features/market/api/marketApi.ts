import { useApiClient } from '~/composables/useApiClient'
import type { Candle, Rates } from '../types'

interface CandleDto { time: string; open: number; high: number; low: number; close: number; tick_volume: number }

export const toCandle = (d: CandleDto): Candle => ({
  time: Math.floor(new Date(d.time).getTime() / 1000),
  open: d.open,
  high: d.high,
  low: d.low,
  close: d.close,
  tickVolume: d.tick_volume,
})

export const marketApi = {
  async getRates(symbol: string, timeframe: string, count = 300): Promise<Rates> {
    const data = await useApiClient().get<{ symbol: string; timeframe: string; candles: CandleDto[] }>('/mt5/rates', {
      symbol,
      timeframe,
      count,
    })
    return { symbol: data.symbol, timeframe: data.timeframe, candles: data.candles.map(toCandle) }
  },
}
