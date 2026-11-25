<template>
  <div class="space-y-4">
    <p v-if="!points.length" class="text-sm text-zinc-500 py-8 text-center">{{ t('analytics.equity.empty') }}</p>
    <div v-else ref="el" class="w-full h-80"></div>
    <dl class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex justify-between"><dt class="text-zinc-500">{{ t('analytics.equity.starting') }}</dt><dd class="font-mono">{{ money(summary.startingBalance) }}</dd></div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex justify-between"><dt class="text-zinc-500">{{ t('analytics.equity.ending') }}</dt><dd class="font-mono">{{ money(summary.endingBalance) }}</dd></div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex justify-between"><dt class="text-zinc-500">{{ t('analytics.equity.best_day') }}</dt><dd class="font-mono" :class="pnlClass(summary.bestDayNet)">{{ formatMoney(summary.bestDayNet) }}</dd></div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex justify-between"><dt class="text-zinc-500">{{ t('analytics.equity.worst_day') }}</dt><dd class="font-mono" :class="pnlClass(summary.worstDayNet)">{{ formatMoney(summary.worstDayNet) }}</dd></div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'
import type { EquityPoint, Summary } from '../types'

const props = defineProps<{ points: EquityPoint[]; summary: Summary }>()
const { t } = useI18n()
const el = ref<HTMLElement | null>(null)
let plotly: any = null

/** Balances are real values or "—" when the report did not include them. */
const money = (v: number | null) => (v === null ? '—' : v.toFixed(2))

const draw = async () => {
  await nextTick()
  if (!el.value || !props.points.length) return
  plotly = plotly ?? (await import('plotly.js-dist-min'))
  const dark = document.documentElement.classList.contains('dark')
  const axis = { color: dark ? '#a1a1aa' : '#71717a', gridcolor: dark ? 'rgba(39,39,42,0.5)' : 'rgba(228,228,231,0.6)' }
  plotly.react(
    el.value,
    [{ x: props.points.map((p) => p.time), y: props.points.map((p) => p.equity), type: 'scatter', mode: 'lines', line: { color: '#10b981', width: 2.5 }, fill: 'tozeroy', fillcolor: 'rgba(16,185,129,0.08)' }],
    { xaxis: axis, yaxis: axis, plot_bgcolor: 'transparent', paper_bgcolor: 'transparent', font: { color: dark ? '#fafafa' : '#09090b' }, margin: { t: 15, r: 20, b: 40, l: 60 } },
    { responsive: true, displayModeBar: false },
  )
}

onMounted(draw)
watch(() => props.points, draw)
onBeforeUnmount(() => {
  if (plotly && el.value) plotly.purge(el.value)
})
</script>
