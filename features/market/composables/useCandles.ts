import { ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { marketApi } from '../api/marketApi'
import type { Candle } from '../types'

/** Loads real candles; on any failure `candles` stays empty and `errorCode` says why (never fabricated). */
export const useCandles = () => {
  const candles = ref<Candle[]>([])
  const loading = ref(false)
  const errorCode = ref<string | null>(null)
  let seq = 0

  const load = async (symbol: string, timeframe: string, count = 300) => {
    const mine = ++seq
    loading.value = true
    errorCode.value = null
    try {
      const rates = await marketApi.getRates(symbol, timeframe, count)
      if (mine !== seq) return
      candles.value = rates.candles
      if (!rates.candles.length) errorCode.value = 'OUT_OF_RANGE'
    } catch (err) {
      if (mine !== seq) return
      candles.value = []
      errorCode.value = err instanceof ApiError ? err.code : 'UNKNOWN'
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  return { candles, loading, errorCode, load }
}
