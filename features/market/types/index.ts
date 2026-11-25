export interface Candle {
  /** Unix seconds (UTC), as lightweight-charts expects. */
  time: number
  open: number
  high: number
  low: number
  close: number
  tickVolume: number
}

export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1'

export interface Rates {
  symbol: string
  timeframe: string
  candles: Candle[]
}
