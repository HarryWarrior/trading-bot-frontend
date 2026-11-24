import { beforeEach, describe, expect, it, vi } from 'vitest'
import { marketApi, toCandle } from '~/features/market/api/marketApi'
import { marketErrorKey } from '~/features/market/composables/marketErrors'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('market api', () => {
  it('maps a candle to chart seconds', () => {
    expect(toCandle({ time: '2026-01-01T10:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, tick_volume: 7 })).toEqual({
      time: 1767261600, open: 1, high: 2, low: 0.5, close: 1.5, tickVolume: 7,
    })
  })

  it('requests rates with symbol, timeframe and count', async () => {
    fetchMock.mockResolvedValueOnce(ok({ symbol: 'EURUSD', timeframe: 'M5', candles: [] }))
    const rates = await marketApi.getRates('EURUSD', 'M5', 200)
    expect(rates).toEqual({ symbol: 'EURUSD', timeframe: 'M5', candles: [] })
    expect(fetchMock.mock.calls[0][0]).toBe('/mt5/rates')
    expect(fetchMock.mock.calls[0][1].query).toEqual({ symbol: 'EURUSD', timeframe: 'M5', count: 200 })
  })

  it('maps market error codes to translation keys', () => {
    expect(marketErrorKey('TERMINAL_NOT_AVAILABLE')).toBe('market.errors.terminal')
    expect(marketErrorKey('SYMBOL_NOT_FOUND')).toBe('market.errors.symbol')
    expect(marketErrorKey('SERVER_TIMEZONE_MISMATCH')).toBe('market.errors.timezone')
    expect(marketErrorKey('OUT_OF_RANGE')).toBe('market.errors.out_of_range')
    expect(marketErrorKey('WHATEVER')).toBe('market.errors.generic')
  })
})
