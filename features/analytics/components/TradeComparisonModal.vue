<template>
  <AppModal :is-open="true" :title="t('analytics.compare.title')" max-width="2xl" @close="$emit('close')">
    <div class="space-y-4">
      <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div><div class="text-zinc-500">{{ t('analytics.compare.count') }}</div><div class="font-mono">{{ stats.count }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.total') }}</div><div class="font-mono font-bold" :class="pnlClass(stats.totalNet)">{{ formatMoney(stats.totalNet) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.average') }}</div><div class="font-mono" :class="pnlClass(stats.averageNet)">{{ formatMoney(stats.averageNet) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.win_rate') }}</div><div class="font-mono">{{ formatPercent(stats.winRate) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.rr') }}</div><div class="font-mono">{{ formatRatio(stats.averageRR) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.duration') }}</div><div class="font-mono">{{ formatRatio(stats.averageDurationMinutes) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.best') }}</div><div class="font-mono" :class="pnlClass(stats.best.net)">{{ stats.best.symbol }} {{ formatMoney(stats.best.net) }}</div></div>
        <div><div class="text-zinc-500">{{ t('analytics.compare.worst') }}</div><div class="font-mono" :class="pnlClass(stats.worst.net)">{{ stats.worst.symbol }} {{ formatMoney(stats.worst.net) }}</div></div>
      </div>
      <div class="grid gap-3" :class="trades.length > 1 ? 'md:grid-cols-2' : ''">
        <div v-for="trade in trades" :key="trade.id" class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 space-y-1">
          <div class="flex justify-between text-xs px-1">
            <span class="font-semibold">{{ trade.symbol }} {{ trade.side.toUpperCase() }}</span>
            <span class="font-mono" :class="pnlClass(trade.net)">{{ formatMoney(trade.net) }}</span>
          </div>
          <TradeChart :trade="trade" :height="240" />
        </div>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppModal from '~/components/Common/AppModal.vue'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'
import type { Trade } from '~/features/journal'
import { comparisonStats } from '../composables/comparison'
import { formatPercent, formatRatio } from '../composables/kpi'
import TradeChart from './TradeChart.vue'

const props = defineProps<{ trades: Trade[] }>()
defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const stats = computed(() => comparisonStats(props.trades))
</script>
