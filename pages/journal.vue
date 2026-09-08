<template>
  <div class="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
    <!-- Top Header Bar -->
    <header class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {{ t('app.title') }}
          </h1>
          <AppBadge variant="neutral" size="xs">
            Live Workstation
          </AppBadge>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {{ t('app.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Theme Toggle -->
        <AppThemeToggle />

        <!-- Language Switcher -->
        <div class="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
          <button
            @click="setLocale('en')"
            :class="['px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer', locale === 'en' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-subtle' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200']"
          >
            EN
          </button>
          <button
            @click="setLocale('es')"
            :class="['px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer', locale === 'es' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-subtle' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200']"
          >
            ES
          </button>
        </div>

        <!-- Multi-Account MetaTrader Switcher -->
        <div v-if="mt5Store.accounts.length > 0" class="relative">
          <div class="flex items-center gap-2">
            <!-- Account Dropdown Trigger -->
            <button
              @click="showAccountDropdown = !showAccountDropdown"
              class="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-emerald-500/40 hover:border-emerald-500/70 rounded-xl px-3 py-1.5 shadow-subtle transition-all cursor-pointer text-left"
              :aria-label="t('mt5.switch_account')"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none flex items-center gap-1.5">
                  <span>{{ activeMt5Account?.account_name || t('mt5.active_account') }}</span>
                  <span class="text-[10px] text-zinc-400">▼</span>
                </div>
                <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ${{ (activeMt5Account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>
            </button>

            <!-- Deal Sync Button -->
            <AppButton
              variant="secondary"
              size="sm"
              :disabled="mt5Store.syncing"
              :title="t('actions.sync')"
              @click="syncMt5"
            >
              <template #startIcon>
                <span :class="{ 'animate-spin': mt5Store.syncing }">🔄</span>
              </template>
              <span class="hidden sm:inline">{{ mt5Store.syncing ? t('actions.syncing') : t('actions.sync') }}</span>
            </AppButton>
          </div>

          <!-- Accounts Dropdown Menu -->
          <div
            v-if="showAccountDropdown"
            class="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-dropdown z-50 overflow-hidden"
          >
            <div class="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              {{ t('mt5.accounts_list') }} ({{ mt5Store.accounts.length }})
            </div>

            <div class="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              <div
                v-for="acc in mt5Store.accounts"
                :key="acc.id"
                @click="switchAccount(acc.id)"
                :class="['flex items-center justify-between gap-2 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition cursor-pointer', { 'bg-zinc-50 dark:bg-zinc-800/80 border-l-2 border-emerald-500': acc.id === mt5Store.activeAccountId }]"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-xs truncate text-zinc-900 dark:text-zinc-100">{{ acc.account_name }}</span>
                    <AppBadge v-if="acc.id === mt5Store.activeAccountId" variant="success" size="xs">
                      ACTIVE
                    </AppBadge>
                  </div>
                  <div class="text-[10px] text-zinc-400 font-mono">
                    {{ acc.server }} · #{{ acc.login }}
                  </div>
                  <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    ${{ acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </div>
                </div>

                <!-- Delete / Disconnect Account Button -->
                <button
                  type="button"
                  @click.stop="openDeleteModal(acc.id, acc.account_name)"
                  class="text-zinc-400 hover:text-red-500 p-1.5 rounded transition text-xs cursor-pointer"
                  :title="t('mt5.remove_account')"
                  aria-label="Remove Account"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Add Another Account Button -->
            <button
              type="button"
              @click="openAddAccountModal"
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 border-t border-zinc-100 dark:border-zinc-800 transition cursor-pointer"
            >
              <span>+</span>
              <span>{{ t('mt5.add_account') }}</span>
            </button>
          </div>
        </div>

        <!-- Connect Account Button (When no accounts exist) -->
        <AppButton
          v-else
          variant="primary"
          size="sm"
          @click="showMt5Modal = true"
        >
          <template #startIcon>
            <span>🔗</span>
          </template>
          {{ t('nav.connect_mt5') }}
        </AppButton>

        <NuxtLink to="/upload">
          <AppButton variant="secondary" size="sm">
            <template #startIcon>
              <span>📤</span>
            </template>
            {{ t('nav.upload') }}
          </AppButton>
        </NuxtLink>
      </div>
    </header>

    <!-- Feedback & Loading Banner -->
    <div v-if="analyticsStore.loading && !analytics" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AppSkeleton v-for="i in 5" :key="i" height="h-28" />
      </div>
      <AppSkeleton height="h-96" />
    </div>

    <!-- SECCIÓN 1: KPI WIDGETS -->
    <section v-if="analytics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <AppMetricCard
        :title="t('kpi.total_profit')"
        :value="`$${(analytics.total_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
        :delta="analytics.total_profit_pct"
        :is-positive="(analytics.total_profit || 0) >= 0"
      />
      <AppMetricCard
        :title="t('kpi.win_rate')"
        :value="`${analytics.win_rate || 0}%`"
        :subtitle="`${analytics.winning_trades || 0} / ${analytics.total_trades || 0} trades`"
        tooltip="Percentage of profitable closed trades out of total executed trades."
      />
      <AppMetricCard
        :title="t('kpi.profit_factor')"
        :value="analytics.profit_factor || 0"
        :tooltip="t('tooltip.profit_factor')"
        subtitle="Gross Win / Gross Loss"
      />
      <AppMetricCard
        :title="t('kpi.max_drawdown')"
        :value="`$${(analytics.max_drawdown || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
        :delta="analytics.max_drawdown_pct !== undefined ? -Math.abs(analytics.max_drawdown_pct) : undefined"
        :is-positive="false"
        tooltip="Peak-to-valley equity decline across the trading statement."
      />
      <AppMetricCard
        :title="t('kpi.best_streak')"
        :value="`${analytics.longest_win_streak || 0} wins`"
        :tooltip="t('tooltip.streak')"
        subtitle="Longest Consecutive Run"
      />
    </section>

    <!-- SECCIÓN 2: EQUITY CURVE -->
    <section v-if="analytics" class="dub-card p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>📈</span>
          <span>{{ t('chart.equity_curve') }}</span>
        </h2>
      </div>
      <AnalyticsEquityCurveChart 
        :analytics="analytics"
        :dates="analytics.equity_dates"
        :values="analytics.equity_curve"
      />
    </section>

    <!-- SECCIÓN 3: CALENDAR HEATMAP -->
    <section v-if="analytics" class="dub-card p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>📅</span>
          <span>{{ t('chart.heatmap') }}</span>
        </h2>
      </div>
      <AnalyticsCalendarHeatmap
        :daily-stats="analytics.daily_stats"
        :best-day="analytics.best_day_profit?.toString()"
        :worst-day="analytics.worst_day_profit?.toString()"
        @filter-day="onHeatmapDayFilter"
      />
    </section>

    <!-- SECCIÓN 4: TABLA DE OPERACIONES -->
    <section class="dub-card p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>📋</span>
            <span>{{ t('chart.trades_table') }}</span>
          </h2>
          <AppBadge variant="neutral" size="xs">
            {{ filteredTrades.length }} trades
          </AppBadge>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <AppInput
          v-model="filters.symbol"
          placeholder="Symbol (e.g. EURUSD)"
          size="sm"
        />
        
        <select
          v-model="filters.status"
          class="h-8 text-xs px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-200 transition"
        >
          <option value="">All Outcomes</option>
          <option value="GANADOR">{{ t('status.winner') }}</option>
          <option value="PERDEDOR">{{ t('status.loser') }}</option>
          <option value="BREAK_EVEN">{{ t('status.break_even') }}</option>
        </select>

        <AppInput
          v-model="filters.dateFrom"
          type="date"
          size="sm"
        />

        <AppInput
          v-model="filters.dateTo"
          type="date"
          size="sm"
        />

        <AppButton
          variant="primary"
          size="sm"
          @click="applyFilters"
        >
          <template #startIcon>
            <span>🔍</span>
          </template>
          {{ t('actions.filter') }}
        </AppButton>
      </div>

      <AnalyticsTradesTable
        :trades="filteredTrades"
        :loading="analyticsStore.loading"
        :total="analytics?.total_trades"
      />
    </section>

    <!-- MT5 Connection Modal -->
    <AnalyticsMt5ConnectModal
      v-if="showMt5Modal"
      @close="showMt5Modal = false"
      @connected="onMt5Connected"
    />

    <!-- Double-Confirmation Delete Account Modal -->
    <AppConfirmDeleteModal
      :is-open="showDeleteModal"
      title="Disconnect MetaTrader Account"
      :message="`Are you sure you want to disconnect ${accountToDeleteName}? All synced deal history for this account will be removed.`"
      :confirm-text="accountToDeleteName"
      @cancel="showDeleteModal = false"
      @confirm="confirmDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '~/stores/analytics'
import { useMT5Store } from '~/stores/mt5'
import { useI18n } from '~/composables/useI18n'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'
import AppButton from '~/components/Common/AppButton.vue'
import AppInput from '~/components/Common/AppInput.vue'
import AppBadge from '~/components/Common/AppBadge.vue'
import AppMetricCard from '~/components/Common/AppMetricCard.vue'
import AppThemeToggle from '~/components/Common/AppThemeToggle.vue'
import AppConfirmDeleteModal from '~/components/Common/AppConfirmDeleteModal.vue'
import AnalyticsEquityCurveChart from '~/components/Analytics/EquityCurveChart.vue'
import AnalyticsCalendarHeatmap from '~/components/Analytics/CalendarHeatmap.vue'
import AnalyticsTradesTable from '~/components/Analytics/TradesTable.vue'
import AnalyticsMt5ConnectModal from '~/components/Analytics/Mt5ConnectModal.vue'

const { t, locale, setLocale } = useI18n()
const analyticsStore = useAnalyticsStore()
const mt5Store = useMT5Store()

const showMt5Modal = ref(false)
const showAccountDropdown = ref(false)
const showDeleteModal = ref(false)
const accountToDeleteId = ref<string | null>(null)
const accountToDeleteName = ref('')

const analytics = computed(() => analyticsStore.analytics)
const trades = computed(() => analyticsStore.trades)
const activeMt5Account = computed(() => mt5Store.activeAccount)

const switchAccount = async (accountId: string) => {
  await mt5Store.setActiveAccount(accountId)
  showAccountDropdown.value = false
}

const openDeleteModal = (accountId: string, accountName: string) => {
  accountToDeleteId.value = accountId
  accountToDeleteName.value = accountName
  showAccountDropdown.value = false
  showDeleteModal.value = true
}

const confirmDeleteAccount = async () => {
  if (accountToDeleteId.value) {
    await mt5Store.deleteAccount(accountToDeleteId.value)
    showDeleteModal.value = false
  }
}

const openAddAccountModal = () => {
  showAccountDropdown.value = false
  showMt5Modal.value = true
}

const filters = ref({
  symbol: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

const filteredTrades = computed(() => {
  return trades.value.filter(trade => {
    if (filters.value.symbol && !trade.symbol.toLowerCase().includes(filters.value.symbol.toLowerCase())) return false
    if (filters.value.status && trade.status !== filters.value.status) return false
    if (filters.value.dateFrom && new Date(trade.open_time) < new Date(filters.value.dateFrom)) return false
    if (filters.value.dateTo && new Date(trade.open_time) > new Date(filters.value.dateTo)) return false
    return true
  })
})

const applyFilters = async () => {
  await analyticsStore.fetchTrades({
    symbol: filters.value.symbol || undefined,
    status: filters.value.status || undefined,
    date_from: filters.value.dateFrom || undefined,
    date_to: filters.value.dateTo || undefined
  })
}

const onHeatmapDayFilter = (dateStr: string | null) => {
  if (dateStr) {
    filters.value.dateFrom = dateStr
    filters.value.dateTo = dateStr
  } else {
    filters.value.dateFrom = ''
    filters.value.dateTo = ''
  }
}

const syncMt5 = async () => {
  await mt5Store.syncAccount()
}

const onMt5Connected = async () => {
  await mt5Store.fetchAccounts()
  await analyticsStore.fetchAnalytics()
  await analyticsStore.fetchTrades()
}

onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchAnalytics(),
    analyticsStore.fetchTrades(),
    mt5Store.fetchAccounts()
  ])
})

useHead({
  title: 'Trading Journal & Analytics'
})
</script>

<style scoped>
/* Component styles */
</style>
