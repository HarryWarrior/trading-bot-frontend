import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { journalApi } from '../api/journalApi'
import { isInvalidDateRange } from '../composables/tradeQuery'
import type { JournalPagination, SortDir, Trade, TradeFilters, TradeSortBy } from '../types'

const emptyFilters = (): TradeFilters => ({
  q: '',
  symbol: '',
  outcome: '',
  dateFrom: '',
  dateTo: '',
  accountRef: null,
})

export const useJournalTradesStore = defineStore('journalTrades', () => {
  const trades = ref<Trade[]>([])
  const pagination = ref<JournalPagination | null>(null)
  const filters = ref<TradeFilters>(emptyFilters())
  const page = ref(1)
  const pageSize = ref(20)
  const sortBy = ref<TradeSortBy>('close_time')
  const sortDir = ref<SortDir>('desc')
  const loading = ref(false)
  /** `ApiError.code` of the last failed load; null when fine. */
  const error = ref<string | null>(null)
  const loaded = ref(false)

  let requestId = 0

  const hasFilters = computed(() => {
    const f = filters.value
    return !!(f.q || f.symbol || f.outcome || f.dateFrom || f.dateTo || f.accountRef)
  })

  const rangeError = computed(() => isInvalidDateRange(filters.value.dateFrom, filters.value.dateTo))

  const load = async () => {
    if (rangeError.value) return
    const id = ++requestId
    loading.value = true
    error.value = null
    try {
      const data = await journalApi.listTrades({
        ...filters.value,
        page: page.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
      })
      if (id !== requestId) return
      trades.value = data.items
      pagination.value = data.pagination
      loaded.value = true
    } catch (err) {
      if (id !== requestId) return
      // Never keep stale rows next to an error.
      trades.value = []
      pagination.value = null
      error.value = err instanceof ApiError ? err.code : 'UNKNOWN'
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  const setFilters = async (next: Partial<TradeFilters>) => {
    filters.value = { ...filters.value, ...next }
    page.value = 1
    await load()
  }

  const resetFilters = async () => {
    filters.value = emptyFilters()
    page.value = 1
    await load()
  }

  const setPage = async (next: number) => {
    page.value = next
    await load()
  }

  const setPageSize = async (size: number) => {
    pageSize.value = size
    page.value = 1
    await load()
  }

  const setSort = async (by: TradeSortBy, dir?: SortDir) => {
    if (dir) sortDir.value = dir
    else sortDir.value = sortBy.value === by && sortDir.value === 'desc' ? 'asc' : 'desc'
    sortBy.value = by
    page.value = 1
    await load()
  }

  return {
    trades, pagination, filters, page, pageSize, sortBy, sortDir, loading, error, loaded, hasFilters, rangeError,
    load, setFilters, resetFilters, setPage, setPageSize, setSort,
  }
})
