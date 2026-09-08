<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <div class="flex-1 min-w-[240px]">
        <AppInput
          v-model="searchQuery"
          placeholder="Filter trades by symbol, type, or ID (e.g. EURUSD, BUY)..."
          size="sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="secondary"
          size="sm"
          @click="showCompareModal = true"
        >
          <template #startIcon>
            <span>📊</span>
          </template>
          {{ t('nav.compare') }}
        </AppButton>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="space-y-2 py-2">
      <AppSkeleton height="h-10" />
      <AppSkeleton height="h-10" />
      <AppSkeleton height="h-10" />
      <AppSkeleton height="h-10" />
    </div>

    <!-- Table -->
    <div v-else-if="paginatedTrades.length > 0" class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-card bg-white dark:bg-zinc-900/40">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 select-none">
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('open_time')">
              Open Time
              <span v-if="sortColumn === 'open_time'" class="ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('symbol')">
              Symbol
              <span v-if="sortColumn === 'symbol'" class="ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('order_type')">
              Type
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('volume')">
              Lots
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('open_price')">
              Entry
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('close_price')">
              Exit
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('profit_usd')">
              P&L ($)
              <span v-if="sortColumn === 'profit_usd'" class="ml-1">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('profit_pct')">
              P&L (%)
            </th>
            <th class="px-4 py-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap" @click="sortBy('duration')">
              Duration
            </th>
            <th class="px-4 py-3">Outcome</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          <tr
            v-for="trade in paginatedTrades"
            :key="trade.id"
            @click="selectedTrade = trade"
            class="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
          >
            <td class="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              {{ formatDate(trade.open_time) }}
            </td>
            <td class="px-4 py-3 font-semibold text-xs text-zinc-900 dark:text-zinc-100">
              {{ trade.symbol }}
            </td>
            <td class="px-4 py-3">
              <AppBadge :variant="trade.order_type === 'BUY' ? 'success' : 'danger'" size="xs">
                {{ trade.order_type }}
              </AppBadge>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
              {{ trade.volume }}
            </td>
            <td class="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
              {{ trade.open_price.toFixed(5) }}
            </td>
            <td class="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
              {{ trade.close_price.toFixed(5) }}
            </td>
            <td class="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap" :class="trade.profit_usd >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
              {{ trade.profit_usd >= 0 ? '+' : '' }}{{ formatCurrency(trade.profit_usd) }}
            </td>
            <td class="px-4 py-3 font-mono text-xs whitespace-nowrap" :class="trade.profit_pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
              {{ trade.profit_pct >= 0 ? '+' : '' }}{{ trade.profit_pct.toFixed(2) }}%
            </td>
            <td class="px-4 py-3 text-xs text-zinc-400">
              {{ formatDuration(trade.duration) }}
            </td>
            <td class="px-4 py-3">
              <AppBadge :variant="getStatusVariant(trade.status)" size="xs" :dot="true">
                {{ trade.status }}
              </AppBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <AppEmptyState
      v-else
      title="No trades found"
      description="No trade execution records match your active search or filter criteria."
    />

    <!-- Pagination -->
    <AppPagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="filteredTrades.length"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event"
    />

    <!-- Modals -->
    <TradeChartModal
      v-if="selectedTrade"
      :trade="selectedTrade"
      @close="selectedTrade = null"
    />

    <BacktestingCompareModal
      v-if="showCompareModal"
      :trades="trades"
      @close="showCompareModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Trade } from '~/types/analytics'
import TradeChartModal from './TradeChartModal.vue'
import BacktestingCompareModal from './BacktestingCompareModal.vue'
import AppPagination from '~/components/Common/AppPagination.vue'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'
import AppButton from '~/components/Common/AppButton.vue'
import AppInput from '~/components/Common/AppInput.vue'
import AppBadge from '~/components/Common/AppBadge.vue'
import AppEmptyState from '~/components/Common/AppEmptyState.vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  trades: Trade[]
  loading?: boolean
  total?: number
}>()

const { t } = useI18n()

const sortColumn = ref('open_time')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedTrade = ref<Trade | null>(null)
const showCompareModal = ref(false)

const searchQuery = ref('')
const debouncedSearch = ref('')
let debounceTimer: any = null

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newVal.toLowerCase().trim()
    currentPage.value = 1
  }, 300)
})

const currentPage = ref(1)
const pageSize = ref(20)

const filteredTrades = computed(() => {
  if (!debouncedSearch.value) return props.trades

  return props.trades.filter(t => 
    t.symbol.toLowerCase().includes(debouncedSearch.value) ||
    t.order_type.toLowerCase().includes(debouncedSearch.value) ||
    t.status.toLowerCase().includes(debouncedSearch.value) ||
    String(t.id).includes(debouncedSearch.value)
  )
})

const sortedTrades = computed(() => {
  return [...filteredTrades.value].sort((a: any, b: any) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedTrades.value.slice(start, start + pageSize.value)
})

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
}

const getStatusVariant = (status: string) => {
  if (status === 'GANADOR' || status === 'WINNER') return 'success'
  if (status === 'PERDEDOR' || status === 'LOSER') return 'danger'
  return 'neutral'
}

const formatDate = (date: string) => new Date(date).toLocaleString()
const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(val)
</script>

<style scoped>
/* Component styles */
</style>
