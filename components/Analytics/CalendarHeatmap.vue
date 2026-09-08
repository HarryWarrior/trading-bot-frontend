<template>
  <div class="calendar-heatmap-container">
    <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
      <div class="flex items-center gap-2">
        <h2 class="chart-title flex items-center gap-2">
          <span>📅</span> {{ t('chart.heatmap') }}
        </h2>
        <AppTooltip :text="t('tooltip.max_drawdown')" title="Daily P&L">
          <span class="info-icon">ⓘ</span>
        </AppTooltip>
      </div>

      <div v-if="selectedDay" class="flex items-center gap-2">
        <span class="text-xs text-blue-400 font-mono">Filter: {{ selectedDay }}</span>
        <button @click="clearDayFilter" class="btn-clear">✕ Clear</button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div v-if="dailyStats && dailyStats.length > 0" class="calendar-grid">
      <div
        v-for="day in dailyStats"
        :key="day.date"
        :class="[
          'calendar-day group',
          getDayColor(day.profit),
          { 'ring-2 ring-blue-400 scale-105': selectedDay === day.date }
        ]"
        @click="selectDay(day.date)"
      >
        <AppTooltip 
          :title="formatDate(day.date)" 
          :text="`P&L: ${day.profit >= 0 ? '+' : ''}$${day.profit.toFixed(2)} | Trades: ${day.trades}`"
        >
          <div class="w-full">
            <div class="day-date">{{ getDateNumber(day.date) }}</div>
            <div class="day-profit">
              {{ day.profit >= 0 ? '+' : '' }}{{ Math.round(day.profit) }}
            </div>
          </div>
        </AppTooltip>
      </div>
    </div>

    <div v-else class="no-data">
      <AppSkeleton height="h-28" />
    </div>

    <!-- Legend -->
    <div class="heatmap-legend">
      <div class="legend-item">
        <span class="legend-color bg-emerald-700"></span> > $1,000
      </div>
      <div class="legend-item">
        <span class="legend-color bg-emerald-900/80"></span> > $100
      </div>
      <div class="legend-item">
        <span class="legend-color bg-gray-700"></span> Break Even
      </div>
      <div class="legend-item">
        <span class="legend-color bg-rose-900/80"></span> &lt; $0
      </div>
      <div class="legend-item">
        <span class="legend-color bg-rose-700"></span> &lt; -$500
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DailyStat } from '~/types/analytics'
import { useI18n } from '~/composables/useI18n'
import AppTooltip from '~/components/Common/AppTooltip.vue'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'

const props = defineProps<{
  dailyStats?: DailyStat[]
  bestDay?: string
  worstDay?: string
}>()

const emit = defineEmits<{
  (e: 'filter-day', date: string | null): void
}>()

const { t } = useI18n()
const selectedDay = ref<string | null>(null)

const getDayColor = (profit: number) => {
  if (profit >= 1000) return 'bg-emerald-600 hover:bg-emerald-500'
  if (profit > 0) return 'bg-emerald-700/90 hover:bg-emerald-700'
  if (profit === 0) return 'bg-zinc-800 hover:bg-zinc-700'
  if (profit > -500) return 'bg-rose-900/90 hover:bg-rose-800'
  return 'bg-rose-700 hover:bg-rose-600'
}

const getDateNumber = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  return parts.length >= 3 ? parts[2] : new Date(dateStr).getDate()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const selectDay = (dateStr: string) => {
  if (selectedDay.value === dateStr) {
    selectedDay.value = null
  } else {
    selectedDay.value = dateStr
  }
  emit('filter-day', selectedDay.value)
}

const clearDayFilter = () => {
  selectedDay.value = null
  emit('filter-day', null)
}
</script>

<style scoped>
.calendar-heatmap-container {
  @apply space-y-4;
}

.chart-title {
  @apply text-base font-semibold text-zinc-900 dark:text-zinc-100;
}

.info-icon {
  @apply text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-help font-mono;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
  gap: 0.375rem;
}

.calendar-day {
  @apply p-2 rounded-lg cursor-pointer transition text-white text-center border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm flex flex-col justify-center items-center select-none;
}

.day-date {
  @apply text-xs font-semibold font-mono opacity-90;
}

.day-profit {
  @apply text-[10px] mt-0.5 font-mono font-semibold;
}

.no-data {
  @apply text-center text-zinc-400 py-4;
}

.heatmap-legend {
  @apply flex gap-4 justify-center flex-wrap text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80;
}

.legend-item {
  @apply flex items-center gap-1.5;
}

.legend-color {
  @apply w-3 h-3 rounded-sm border border-zinc-300 dark:border-zinc-700/50;
}

.btn-clear {
  @apply text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 transition cursor-pointer;
}
</style>

