<template>
  <div class="space-y-4">
    <div id="equity-chart" class="w-full h-96"></div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
      <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Initial Balance:</span>
        <span class="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{{ formatCurrency(initialBalance) }}</span>
      </div>
      <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Final Balance:</span>
        <span class="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{{ formatCurrency(finalBalance) }}</span>
      </div>
      <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Max Drawdown:</span>
        <span class="font-semibold font-mono text-rose-600 dark:text-rose-400">{{ analytics?.max_drawdown }}</span>
      </div>
      <div class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Best Day Profit:</span>
        <span class="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{{ formatCurrency(analytics?.best_day_profit || 0) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Analytics } from '~/types/analytics'

const props = defineProps<{
  analytics: Analytics | null
  dates?: string[]
  values?: number[]
}>()

const initialBalance = ref(0)
const finalBalance = ref(0)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const renderChart = async () => {
  if (!props.analytics?.equity_dates || !props.analytics?.equity_curve) {
    return
  }
  
  const dates = props.dates || props.analytics.equity_dates
  const values = props.values || props.analytics.equity_curve
  
  if (!dates.length || !values.length) return
  
  initialBalance.value = values[0]
  finalBalance.value = values[values.length - 1]
  
  const Plotly = await import('plotly.js-dist-min')
  
  const trace = {
    x: dates,
    y: values,
    type: 'scatter',
    mode: 'lines',
    name: 'Equity',
    line: {
      color: '#10b981',
      width: 2.5
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(16, 185, 129, 0.08)'
  }
  
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const layout = {
    title: '',
    xaxis: { 
      title: 'Date',
      color: isDark ? '#a1a1aa' : '#71717a',
      gridcolor: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(228, 228, 231, 0.6)'
    },
    yaxis: { 
      title: 'Balance ($)',
      color: isDark ? '#a1a1aa' : '#71717a',
      gridcolor: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(228, 228, 231, 0.6)'
    },
    hovermode: 'closest',
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: { 
      color: isDark ? '#fafafa' : '#09090b',
      family: 'Inter, sans-serif'
    },
    margin: { t: 15, r: 20, b: 40, l: 60 }
  }
  
  const config = {
    responsive: true,
    displayModeBar: false
  }
  
  Plotly.newPlot('equity-chart', [trace], layout, config)
}

onMounted(() => {
  renderChart()
})

watch(() => props.analytics, () => {
  renderChart()
}, { deep: true })
</script>

<style scoped>
/* Component styles */
</style>
