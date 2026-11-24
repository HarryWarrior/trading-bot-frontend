<template>
  <p v-if="!hours.length" class="text-sm text-zinc-500 py-6 text-center">{{ t('analytics.hourly.empty') }}</p>
  <div v-else class="flex items-end gap-1 h-40" role="img" :aria-label="t('analytics.hourly.title')">
    <div v-for="h in hours" :key="h.hour" class="flex-1 flex flex-col items-center justify-end h-full min-w-0" :title="`${h.hour}:00 — ${formatMoney(h.net)} (${h.trades})`">
      <div class="w-full rounded-t" :class="h.net >= 0 ? 'bg-emerald-500' : 'bg-rose-500'" :style="{ height: `${barHeight(h.net)}%` }"></div>
      <span class="text-[9px] text-zinc-500 mt-1">{{ h.hour }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { formatMoney } from '~/features/journal/composables/format'
import type { HourStat } from '../types'

const props = defineProps<{ hours: HourStat[] }>()
const { t } = useI18n()
const maxAbs = computed(() => Math.max(1e-9, ...props.hours.map((h) => Math.abs(h.net))))
const barHeight = (net: number) => Math.max(2, (Math.abs(net) / maxAbs.value) * 80)
</script>
