<template>
  <div class="space-y-6">
    <div class="max-w-xs">
      <AccountSelector :model-value="accountRef" :label="t('journal.accounts.label')" @update:model-value="onAccount" />
    </div>

    <!-- Any in-flight load (first, retry, account switch) hides the previous numbers. -->
    <div v-if="loading" class="space-y-4" aria-busy="true">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppSkeleton v-for="n in 8" :key="n" height="h-28" />
      </div>
      <AppSkeleton height="h-80" />
    </div>

    <div v-else-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-3" role="alert">
      <span>{{ errorMessage }}</span>
      <AppButton variant="secondary" size="sm" @click="reload">{{ t('analytics.retry') }}</AppButton>
    </div>

    <AppEmptyState
      v-else-if="isEmpty"
      :title="t('analytics.empty.title')"
      :description="t('analytics.empty.description')"
    >
      <template #action>
        <NuxtLink to="/upload"><AppButton variant="primary" size="sm">{{ t('analytics.empty.action') }}</AppButton></NuxtLink>
      </template>
    </AppEmptyState>

    <template v-else-if="summary">
      <KpiGrid :summary="summary" />
      <section class="dub-card p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('analytics.equity.title') }}</h2>
        <EquityCurve :points="equity" :summary="summary" />
      </section>
      <section class="dub-card p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('analytics.calendar.title') }}</h2>
        <DailyHeatmap :days="daily" />
      </section>
      <div class="grid lg:grid-cols-2 gap-6">
        <section class="dub-card p-6 space-y-4">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('analytics.symbols.title') }}</h2>
          <SymbolTable :symbols="bySymbol" />
        </section>
        <section class="dub-card p-6 space-y-4">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('analytics.hourly.title') }}</h2>
          <HourlyBars :hours="hourly" />
        </section>
      </div>
      <section class="dub-card p-6 space-y-4">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('analytics.recent.title') }}</h2>
        <RecentTrades :trades="recent.trades" :failed="recent.failed" />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from '~/composables/useI18n'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'
import AppButton from '~/components/Common/AppButton.vue'
import AppEmptyState from '~/components/Common/AppEmptyState.vue'
import { AccountSelector } from '~/features/journal'
import { useAnalyticsDashboardStore } from '../stores/analyticsDashboard'
import { useRecentTradesStore } from '../stores/recentTrades'
import KpiGrid from './KpiGrid.vue'
import EquityCurve from './EquityCurve.vue'
import DailyHeatmap from './DailyHeatmap.vue'
import SymbolTable from './SymbolTable.vue'
import HourlyBars from './HourlyBars.vue'
import RecentTrades from './RecentTrades.vue'

const { t } = useI18n()
const store = useAnalyticsDashboardStore()
const recent = useRecentTradesStore()
const { summary, equity, daily, bySymbol, hourly, loading, error, isEmpty } = storeToRefs(store)
const accountRef = ref<string | null>(null)

const errorMessage = computed(() => {
  const key = `analytics.error.${error.value}`
  const text = t(key)
  return text === key ? t('analytics.error.generic') : text
})

const reload = () => Promise.all([store.load(accountRef.value), recent.load(accountRef.value)])
const onAccount = (value: string | null) => {
  accountRef.value = value
  reload()
}

onMounted(reload)
</script>
