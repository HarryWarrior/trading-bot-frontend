import { defineStore } from 'pinia'
import { ref } from 'vue'
import { journalApi } from '~/features/journal'
import type { Trade } from '~/features/journal'

/** Latest closed trades of the selected account, used to open charts and comparisons. */
export const useRecentTradesStore = defineStore('recentTrades', () => {
  const trades = ref<Trade[]>([])
  const loading = ref(false)
  const failed = ref(false)
  let seq = 0

  const load = async (accountRef: string | null = null) => {
    const mine = ++seq
    loading.value = true
    failed.value = false
    try {
      const page = await journalApi.listTrades({ page: 1, pageSize: 10, sortBy: 'close_time', sortDir: 'desc', accountRef })
      if (mine === seq) trades.value = page.items
    } catch {
      if (mine === seq) {
        trades.value = []
        failed.value = true
      }
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  return { trades, loading, failed, load }
})
