<template>
  <div class="space-y-4">
    <form class="grid grid-cols-2 lg:grid-cols-6 gap-3 items-end" @submit.prevent="applyNow">
      <AppInput v-model="symbol" :label="t('journal.trades.symbol')" placeholder="EURUSD" />
      <label class="block">
        <span class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{{ t('journal.trades.outcome') }}</span>
        <select v-model="outcome" :class="controlClass" @change="applyNow">
          <option value="">{{ t('journal.trades.outcome_all') }}</option>
          <option value="win">{{ t('journal.trades.win') }}</option>
          <option value="loss">{{ t('journal.trades.loss') }}</option>
          <option value="breakeven">{{ t('journal.trades.breakeven') }}</option>
        </select>
      </label>
      <label class="block">
        <span class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{{ t('journal.trades.date_from') }}</span>
        <input v-model="dateFrom" type="date" :class="controlClass" @change="applyNow" />
      </label>
      <label class="block">
        <span class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{{ t('journal.trades.date_to') }}</span>
        <input v-model="dateTo" type="date" :class="controlClass" @change="applyNow" />
      </label>
      <AccountSelector :model-value="filters.accountRef ?? null" :label="t('journal.accounts.label')" @update:model-value="(v) => setFilters({ accountRef: v })" />
      <AppButton v-if="hasFilters" variant="secondary" size="sm" type="button" @click="clearAll">{{ t('journal.trades.clear') }}</AppButton>
    </form>

    <p v-if="rangeError" class="text-xs text-red-500 font-medium" role="alert">{{ t('journal.trades.range_error') }}</p>

    <div v-if="loading && !loaded" class="space-y-2">
      <AppSkeleton v-for="n in 6" :key="n" height="h-10" />
    </div>

    <div v-else-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-3" role="alert">
      <span>{{ t('journal.trades.load_error') }}</span>
      <AppButton variant="secondary" size="sm" @click="load">{{ t('journal.retry') }}</AppButton>
    </div>

    <AppEmptyState
      v-else-if="!trades.length"
      :title="hasFilters ? t('journal.trades.empty_filtered') : t('journal.trades.empty')"
      :description="hasFilters ? t('journal.trades.empty_filtered_hint') : t('journal.trades.empty_hint')"
      :action-label="hasFilters ? '' : t('journal.trades.go_upload')"
      @action="navigateTo('/upload')"
    />

    <template v-else>
      <div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800" :class="{ 'opacity-60': loading }">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 text-left">
            <tr>
              <th v-for="col in columns" :key="col.key" class="px-3 py-2 whitespace-nowrap" :class="col.right ? 'text-right' : ''">
                <button v-if="col.sort" type="button" class="font-semibold hover:text-zinc-900 dark:hover:text-zinc-100" @click="setSort(col.sort)">
                  {{ col.label }} <span v-if="sortBy === col.sort">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                </button>
                <span v-else class="font-semibold">{{ col.label }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trade in trades" :key="trade.id" class="border-t border-zinc-200 dark:border-zinc-800">
              <td class="px-3 py-2 whitespace-nowrap text-zinc-500">{{ formatDate(trade.closeTime) }}</td>
              <td class="px-3 py-2 font-semibold">{{ trade.symbol }}</td>
              <td class="px-3 py-2 uppercase text-xs">{{ trade.side }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ trade.volume }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ trade.openPrice }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ trade.closePrice }}</td>
              <td class="px-3 py-2 text-right font-mono font-semibold" :class="pnlClass(trade.profit)">{{ formatMoney(trade.profit) }}</td>
              <td class="px-3 py-2 text-right font-mono" :class="pnlClass(trade.net)">{{ formatMoney(trade.net) }}</td>
              <td class="px-3 py-2 text-xs text-zinc-500">{{ isUploadAccount(trade.accountRef) ? t('journal.accounts.upload') : trade.accountRef }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        :current-page="page"
        :page-size="pageSize"
        :total-items="pagination?.totalItems ?? 0"
        @change="onPageChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import AppInput from '~/components/Common/AppInput.vue'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'
import AppEmptyState from '~/components/Common/AppEmptyState.vue'
import AppPagination from '~/components/Common/AppPagination.vue'
import AccountSelector from './AccountSelector.vue'
import { useJournalTrades } from '../composables/useJournal'
import { formatMoney, isUploadAccount, pnlClass } from '../composables/format'
import type { TradeOutcome, TradeSortBy } from '../types'

const { t } = useI18n()
const {
  trades, pagination, filters, page, pageSize, sortBy, sortDir, loading, error, loaded, hasFilters, rangeError,
  load, setFilters, resetFilters, setPage, setPageSize, setSort,
} = useJournalTrades()

const controlClass =
  'w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none'

const symbol = ref(filters.value.symbol ?? '')
const outcome = ref<TradeOutcome | ''>(filters.value.outcome ?? '')
const dateFrom = ref(filters.value.dateFrom ?? '')
const dateTo = ref(filters.value.dateTo ?? '')

let timer: ReturnType<typeof setTimeout> | null = null
const applyNow = () => {
  if (timer) clearTimeout(timer)
  setFilters({ symbol: symbol.value, outcome: outcome.value, dateFrom: dateFrom.value, dateTo: dateTo.value })
}
// 300 ms debounce while typing the symbol.
watch(symbol, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(applyNow, 300)
})
onBeforeUnmount(() => timer && clearTimeout(timer))

const clearAll = async () => {
  symbol.value = ''
  outcome.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  await resetFilters()
}

const onPageChange = async ({ page: nextPage, pageSize: nextSize }: { page: number; pageSize: number }) => {
  if (nextSize !== pageSize.value) await setPageSize(nextSize)
  else await setPage(nextPage)
}

const formatDate = (iso: string) => iso.replace('T', ' ').slice(0, 16)

const columns = computed<Array<{ key: string; label: string; sort?: TradeSortBy; right?: boolean }>>(() => [
  { key: 'close', label: t('journal.trades.close_time'), sort: 'close_time' },
  { key: 'symbol', label: t('journal.trades.symbol'), sort: 'symbol' },
  { key: 'side', label: t('journal.trades.side') },
  { key: 'volume', label: t('journal.trades.volume'), right: true },
  { key: 'open', label: t('journal.trades.open_price'), right: true },
  { key: 'closep', label: t('journal.trades.close_price'), right: true },
  { key: 'profit', label: t('journal.trades.profit'), sort: 'profit', right: true },
  { key: 'net', label: t('journal.trades.net'), right: true },
  { key: 'account', label: t('journal.accounts.label') },
])

onMounted(load)
</script>
