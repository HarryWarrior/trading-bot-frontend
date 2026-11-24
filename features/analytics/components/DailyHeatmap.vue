<template>
  <div>
    <p v-if="!days.length" class="text-sm text-zinc-500 py-6 text-center">{{ t('analytics.calendar.empty') }}</p>
    <div v-else class="grid gap-1.5" style="grid-template-columns: repeat(auto-fill, minmax(64px, 1fr))">
      <div
        v-for="day in days"
        :key="day.day"
        :title="`${day.day}: ${formatMoney(day.net)} (${day.trades} ${t('analytics.calendar.trades')})`"
        class="rounded-lg p-2 text-center text-white select-none"
        :class="cellClass(day.net)"
      >
        <div class="text-xs font-semibold font-mono">{{ day.day.slice(5) }}</div>
        <div class="text-[10px] font-mono">{{ formatMoney(day.net) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { formatMoney } from '~/features/journal/composables/format'
import type { DayStat } from '../types'

defineProps<{ days: DayStat[] }>()
const { t } = useI18n()

const cellClass = (net: number) => {
  if (Number(Math.abs(net).toFixed(2)) === 0) return 'bg-zinc-500'
  return net > 0 ? 'bg-emerald-600' : 'bg-rose-600'
}
</script>
