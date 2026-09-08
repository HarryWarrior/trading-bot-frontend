<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-info">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <span>{{ trade.symbol }}</span>
            <span :class="trade.order_type === 'BUY' ? 'badge-buy' : 'badge-sell'">
              {{ trade.order_type }}
            </span>
            <span class="timeframe-badge">{{ selectedTimeframe }}</span>
          </h3>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatDate(trade.open_time) }} → {{ formatDate(trade.close_time) }}
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn" :title="t('actions.close')">✕</button>
      </div>

      <!-- Timeframe Selector -->
      <div class="timeframe-selector">
        <button 
          v-for="tf in timeframes" 
          :key="tf.value"
          :class="['tf-btn', { active: selectedTimeframe === tf.value }]"
          @click="changeTimeframe(tf.value)"
        >
          {{ tf.label }}
        </button>

        <div v-if="loadingRates" class="text-xs text-blue-400 flex items-center gap-1 ml-auto">
          <span class="animate-spin">⏳</span> Fetching rates...
        </div>
      </div>

      <!-- Candlestick Chart Area -->
      <div class="chart-container" ref="chartContainer"></div>

      <!-- Modal Footer with Trade Stats -->
      <div class="modal-footer">
        <div class="stat-item">
          <span class="label">{{ t('chart.entry') }}:</span>
          <span class="value">{{ trade.open_price.toFixed(5) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ t('chart.sl') }}:</span>
          <span class="value text-red-400 font-mono">{{ estimatedSL.toFixed(5) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ t('chart.tp') }}:</span>
          <span class="value text-green-400 font-mono">{{ estimatedTP.toFixed(5) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ t('chart.rr') }}:</span>
          <span class="value font-bold text-blue-400">1:{{ riskRewardRatio.toFixed(1) }}</span>
        </div>
        <div class="stat-item ml-auto">
          <span class="label">P&L:</span>
          <span :class="trade.profit_usd >= 0 ? 'text-green-400' : 'text-red-400'" class="value font-bold text-lg">
            {{ trade.profit_usd >= 0 ? '+' : '' }}{{ formatCurrency(trade.profit_usd) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { createChart, ColorType, CrosshairMode, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import type { Trade } from '~/types/analytics'
import { useMT5Store } from '~/stores/mt5'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  trade: Trade
}>()

defineEmits(['close'])

const { t } = useI18n()
const mt5Store = useMT5Store()

const chartContainer = ref<HTMLElement | null>(null)
let chart: any = null
let candleSeries: any = null
const loadingRates = ref(false)

const selectedTimeframe = ref('5m')
const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1D' },
]

const priceDelta = computed(() => Math.abs(props.trade.close_price - props.trade.open_price) || (props.trade.open_price * 0.002))

const estimatedSL = computed(() => {
  if (props.trade.order_type === 'BUY') {
    return props.trade.profit_usd >= 0 
      ? props.trade.open_price - (priceDelta.value * 0.5)
      : props.trade.close_price
  } else {
    return props.trade.profit_usd >= 0
      ? props.trade.open_price + (priceDelta.value * 0.5)
      : props.trade.close_price
  }
})

const estimatedTP = computed(() => {
  if (props.trade.order_type === 'BUY') {
    return props.trade.profit_usd >= 0
      ? props.trade.close_price
      : props.trade.open_price + (priceDelta.value * 1.5)
  } else {
    return props.trade.profit_usd >= 0
      ? props.trade.close_price
      : props.trade.open_price - (priceDelta.value * 1.5)
  }
})

const riskRewardRatio = computed(() => {
  const risk = Math.abs(props.trade.open_price - estimatedSL.value)
  const reward = Math.abs(props.trade.open_price - estimatedTP.value)
  return risk > 0 ? reward / risk : 1.5
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const changeTimeframe = async (tf: string) => {
  selectedTimeframe.value = tf
  await loadAndRenderChart()
}

const loadAndRenderChart = async () => {
  if (!chartContainer.value) return

  chartContainer.value.innerHTML = ''
  loadingRates.value = true

  try {
    const chartInstance = createChart(chartContainer.value, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(55, 65, 81, 0.4)' },
        horzLines: { color: 'rgba(55, 65, 81, 0.4)' },
      },
      width: chartContainer.value.clientWidth,
      height: 420,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chart = markRaw(chartInstance)

    candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    // Fetch real candlestick series from API
    let candleData = []
    try {
      const response = await mt5Store.fetchRates(props.trade.symbol, selectedTimeframe.value, 180)
      candleData = response.candles
    } catch {
      // Fallback generation if backend rate service is offline
      candleData = generateFallbackCandles()
    }

    if (candleData.length > 0) {
      candleSeries.setData(candleData)
    }

    // Price Lines
    candleSeries.createPriceLine({
      price: props.trade.open_price,
      color: '#fbbf24',
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: 'ENTRY',
    })

    candleSeries.createPriceLine({
      price: estimatedSL.value,
      color: '#ef4444',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'SL',
    })

    candleSeries.createPriceLine({
      price: estimatedTP.value,
      color: '#10b981',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'TP',
    })

    // Markers for Entry and Exit
    const openTime = Math.floor(new Date(props.trade.open_time).getTime() / 1000)
    const closeTime = Math.floor(new Date(props.trade.close_time).getTime() / 1000)

    if (candleData.length > 0) {
      const entryCandle = candleData.reduce((prev: any, curr: any) =>
        Math.abs(curr.time - openTime) < Math.abs(prev.time - openTime) ? curr : prev
      )

      const exitCandle = candleData.reduce((prev: any, curr: any) =>
        Math.abs(curr.time - closeTime) < Math.abs(prev.time - closeTime) ? curr : prev
      )

      const markers: any[] = [
        {
          time: entryCandle.time,
          position: props.trade.order_type === 'BUY' ? 'belowBar' : 'aboveBar',
          color: '#fbbf24',
          shape: props.trade.order_type === 'BUY' ? 'arrowUp' : 'arrowDown',
          text: `ENTRY @ ${props.trade.open_price.toFixed(5)}`,
        },
        {
          time: exitCandle.time,
          position: props.trade.profit_usd >= 0 ? 'aboveBar' : 'belowBar',
          color: props.trade.profit_usd >= 0 ? '#10b981' : '#ef4444',
          shape: props.trade.profit_usd >= 0 ? 'arrowDown' : 'arrowUp',
          text: `EXIT (${props.trade.profit_usd >= 0 ? '+' : ''}$${props.trade.profit_usd.toFixed(2)})`,
        }
      ]

      createSeriesMarkers(candleSeries, markers)
    }

    chart.timeScale().fitContent()
  } catch (err) {
    console.error('Failed to initialize trade candlestick chart:', err)
  } finally {
    loadingRates.value = false
  }
}

const generateFallbackCandles = () => {
  const data = []
  let price = props.trade.open_price
  let time = Math.floor(Date.now() / 1000) - (300 * 100)
  for (let i = 0; i < 100; i++) {
    const open = price
    const delta = (Math.random() - 0.49) * (price * 0.001)
    const close = open + delta
    const high = Math.max(open, close) + (Math.random() * price * 0.0005)
    const low = Math.min(open, close) - (Math.random() * price * 0.0005)
    data.push({ time, open, high, low, close, volume: 100 })
    price = close
    time += 300
  }
  return data
}

const handleResize = () => {
  if (chart && chartContainer.value) {
    chart.applyOptions({ width: chartContainer.value.clientWidth })
  }
}

onMounted(() => {
  setTimeout(() => {
    loadAndRenderChart()
    window.addEventListener('resize', handleResize)
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.remove()
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4;
}

.modal-content {
  @apply bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden;
}

.modal-header {
  @apply px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50;
}

.close-btn {
  @apply text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-lg cursor-pointer transition p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800;
}

.badge-buy {
  @apply text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full font-bold;
}

.badge-sell {
  @apply text-[11px] bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full font-bold;
}

.timeframe-badge {
  @apply text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md font-mono;
}

.timeframe-selector {
  @apply px-6 py-2.5 bg-zinc-50/60 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 flex-wrap;
}

.tf-btn {
  @apply px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-xs font-semibold transition cursor-pointer border border-transparent;
}

.tf-btn.active {
  @apply bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm;
}

.chart-container {
  @apply w-full h-[420px] bg-white dark:bg-zinc-950;
}

.modal-footer {
  @apply px-6 py-4 bg-zinc-50/60 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-6 flex-wrap text-sm;
}

.stat-item {
  @apply flex flex-col;
}

.label {
  @apply text-[10px] font-semibold uppercase tracking-wider text-zinc-400;
}

.value {
  @apply text-sm text-zinc-800 dark:text-zinc-200 font-mono mt-0.5;
}
</style>

