import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAnalyticsStore } from './analytics'

export interface MT5Account {
  id: string
  user_id?: string
  account_name: string
  login: number
  server: string
  broker_name?: string
  platform: string
  is_connected: boolean
  is_active?: boolean
  last_sync_at?: string
  balance: number
  equity: number
  currency: string
  leverage: number
  created_at: string
}

export interface RateCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface RatesResponse {
  symbol: string
  timeframe: string
  candles: RateCandle[]
  count: number
}

export const useMT5Store = defineStore('mt5', () => {
  const accounts = ref<MT5Account[]>([])
  const activeAccountId = ref<string | null>(null)
  const loading = ref(false)
  const syncing = ref(false)
  const error = ref<string | null>(null)

  const activeAccount = computed(() => {
    return accounts.value.find(a => a.id === activeAccountId.value) || accounts.value[0] || null
  })

  const fetchAccounts = async () => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
      const response = await $fetch<MT5Account[]>(`${baseURL}/api/v1/mt5/accounts`, {
        method: 'GET'
      })
      accounts.value = response || []
      if (accounts.value.length > 0 && !activeAccountId.value) {
        activeAccountId.value = accounts.value[0].id
      }
    } catch (err: any) {
      error.value = err.message || 'Error fetching MT5 accounts'
      console.error('Failed to fetch MT5 accounts:', err)
    } finally {
      loading.value = false
    }
  }

  const connectAccount = async (payload: {
    account_name: string
    login: number
    server: string
    password: string
    broker_name?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
      const account = await $fetch<MT5Account>(`${baseURL}/api/v1/mt5/accounts`, {
        method: 'POST',
        body: payload
      })
      accounts.value.unshift(account)
      activeAccountId.value = account.id

      // Refresh analytics data
      const analyticsStore = useAnalyticsStore()
      await analyticsStore.fetchAnalytics()
      await analyticsStore.fetchTrades()

      return account
    } catch (err: any) {
      const detail = err.data?.detail || err.response?._data?.detail || err.message || 'Error connecting to MT5 account'
      error.value = detail
      throw new Error(detail)
    } finally {
      loading.value = false
    }
  }

  const syncAccount = async (accountId?: string) => {
    const targetId = accountId || activeAccountId.value
    if (!targetId) return

    syncing.value = true
    error.value = null
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
      const response = await $fetch<{ message: string; balance: number; equity: number }>(
        `${baseURL}/api/v1/mt5/accounts/${targetId}/sync`,
        { method: 'POST' }
      )

      // Refresh accounts and analytics
      await fetchAccounts()
      const analyticsStore = useAnalyticsStore()
      await analyticsStore.fetchAnalytics()
      await analyticsStore.fetchTrades()

      return response
    } catch (err: any) {
      error.value = err.data?.detail || err.message || 'Error syncing MT5 deals'
      console.error('Failed to sync MT5 account:', err)
    } finally {
      syncing.value = false
    }
  }

  const setActiveAccount = async (accountId: string) => {
    activeAccountId.value = accountId
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
      await $fetch(`${baseURL}/api/v1/mt5/accounts/${accountId}/activate`, {
        method: 'POST'
      })

      accounts.value.forEach(a => {
        a.is_active = (a.id === accountId)
      })

      // Refresh analytics for the selected account
      const analyticsStore = useAnalyticsStore()
      await analyticsStore.fetchAnalytics()
      await analyticsStore.fetchTrades()
    } catch (err: any) {
      console.error('Failed to set active MT5 account:', err)
    }
  }

  const deleteAccount = async (accountId: string) => {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
      await $fetch(`${baseURL}/api/v1/mt5/accounts/${accountId}`, {
        method: 'DELETE'
      })

      accounts.value = accounts.value.filter(a => a.id !== accountId)
      if (activeAccountId.value === accountId) {
        activeAccountId.value = accounts.value[0]?.id || null
      }

      const analyticsStore = useAnalyticsStore()
      await analyticsStore.fetchAnalytics()
      await analyticsStore.fetchTrades()
    } catch (err: any) {
      error.value = err.data?.detail || err.message || 'Error deleting MT5 account'
      throw new Error(error.value || 'Failed to delete')
    } finally {
      loading.value = false
    }
  }

  const fetchRates = async (symbol: string, timeframe: string = '5m', count: number = 200): Promise<RatesResponse> => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl || 'http://localhost:8000'
    return await $fetch<RatesResponse>(`${baseURL}/api/v1/analytics/rates`, {
      method: 'GET',
      params: { symbol, timeframe, count }
    })
  }

  return {
    accounts,
    activeAccountId,
    activeAccount,
    loading,
    syncing,
    error,
    fetchAccounts,
    connectAccount,
    syncAccount,
    setActiveAccount,
    deleteAccount,
    fetchRates
  }
})
