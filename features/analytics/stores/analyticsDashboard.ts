import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { analyticsApi } from '../api/analyticsApi'
import type { DayStat, EquityPoint, HourStat, Summary, SymbolStat } from '../types'

export const useAnalyticsDashboardStore = defineStore('analyticsDashboard', () => {
  const summary = ref<Summary | null>(null)
  const equity = ref<EquityPoint[]>([])
  const daily = ref<DayStat[]>([])
  const bySymbol = ref<SymbolStat[]>([])
  const hourly = ref<HourStat[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  let seq = 0

  const hasData = computed(() => !!summary.value && summary.value.totalTrades > 0)
  const isEmpty = computed(() => loaded.value && !error.value && !!summary.value && summary.value.totalTrades === 0)

  const clear = () => {
    summary.value = null
    equity.value = []
    daily.value = []
    bySymbol.value = []
    hourly.value = []
  }

  const load = async (accountRef: string | null = null) => {
    const mine = ++seq
    loading.value = true
    error.value = null
    try {
      const [s, e, d, b, h] = await Promise.all([
        analyticsApi.summary(accountRef),
        analyticsApi.equity(accountRef),
        analyticsApi.daily(accountRef),
        analyticsApi.bySymbol(accountRef),
        analyticsApi.hourly(accountRef),
      ])
      if (mine !== seq) return
      summary.value = s
      equity.value = e
      daily.value = d
      bySymbol.value = b
      hourly.value = h
    } catch (err) {
      if (mine !== seq) return
      clear()
      error.value = err instanceof ApiError ? err.code : 'UNKNOWN'
    } finally {
      if (mine === seq) {
        loading.value = false
        loaded.value = true
      }
    }
  }

  return { summary, equity, daily, bySymbol, hourly, loading, loaded, error, hasData, isEmpty, load }
})
