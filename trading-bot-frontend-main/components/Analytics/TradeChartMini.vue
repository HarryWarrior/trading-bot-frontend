<template>
  <div class="trade-chart-mini" :style="{ borderColor: trade.colorCode }">
    <!-- Compact Header -->
    <div class="chart-mini-header">
      <div class="trade-info">
        <span class="symbol">{{ trade.symbol }}</span>
        <span :class="['order-type', trade.order_type === 'BUY' ? 'buy' : 'sell']">
          {{ trade.order_type }}
        </span>
        <span class="timeframe-badge">{{ timeframe }}</span>
      </div>
      <div :class="['pnl', trade.profit_usd >= 0 ? 'positive' : 'negative']">
        {{ formatCurrency(trade.profit_usd) }}
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-container" ref="chartContainer"></div>

    <!-- Compact Footer with Key Stats -->
    <div class="chart-mini-footer" v-if="showControls">
      <div class="stat">
        <span class="label">Entry:</span>
        <span class="value">{{ trade.open_price.toFixed(5) }}</span>
      </div>
      <div class="stat">
        <span class="label">Exit:</span>
        <span class="value">{{ trade.close_price.toFixed(5) }}</span>
      </div>
      <div class="stat">
        <span class="label">Duration:</span>
        <span class="value">{{ formatDuration(trade.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw } from 'vue'
import { createChart, ColorType, CrosshairMode, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import type { TradeComparison } from '~/types/analytics.extended'

const props = withDefaults(defineProps<{
  trade: TradeComparison
  height?: number
  showControls?: boolean
  timeframe?: string
}>(), {
  height: 300,
  showControls: true,
  timeframe: '5m'
})

const chartContainer = ref<HTMLElement | null>(null)
let chart: any = null
let candleSeries: any = null

// Timeframe to seconds mapping
const timeframeSeconds: Record<string, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Generate simulated candle data
const generateData = () => {
  const data = []
  const start = new Date(props.trade.open_time).getTime() / 1000
  const end = new Date(props.trade.close_time).getTime() / 1000
  const duration = end - start
  
  const stepSize = timeframeSeconds[props.timeframe] || 300
  
  const preTradeCandles = 30
  const postTradeCandles = 15
  const tradeDurationCandles = Math.max(8, Math.ceil(duration / stepSize))
  
  let currentPrice = props.trade.open_price
  let currentTime = start - (stepSize * preTradeCandles)
  
  // Pre-trade context
  for (let i = 0; i < preTradeCandles; i++) {
    const open = currentPrice
    const close = open + (Math.random() - 0.5) * (open * 0.0015)
    const high = Math.max(open, close) + Math.random() * (open * 0.0008)
    const low = Math.min(open, close) - Math.random() * (open * 0.0008)
    
    data.push({ time: currentTime, open, high, low, close })
    currentPrice = close
    currentTime += stepSize
  }
  
  // Trade duration
  const priceDiff = props.trade.close_price - props.trade.open_price
  
  for (let i = 0; i <= tradeDurationCandles; i++) {
    const progress = i / tradeDurationCandles
    const targetPrice = props.trade.open_price + (priceDiff * progress)
    
    const open = currentPrice
    const noise = (Math.random() - 0.5) * (props.trade.open_price * 0.0015)
    let close = targetPrice + noise
    
    if (i === 0) close = props.trade.open_price
    if (i === tradeDurationCandles) close = props.trade.close_price
    
    const high = Math.max(open, close) + Math.random() * (open * 0.0008)
    const low = Math.min(open, close) - Math.random() * (open * 0.0008)
    
    data.push({ time: currentTime, open, high, low, close })
    currentPrice = close
    currentTime += stepSize
  }
  
  // Post-trade context
  for (let i = 0; i < postTradeCandles; i++) {
    const open = currentPrice
    const close = open + (Math.random() - 0.5) * (open * 0.0015)
    const high = Math.max(open, close) + Math.random() * (open * 0.0008)
    const low = Math.min(open, close) - Math.random() * (open * 0.0008)
    
    data.push({ time: currentTime, open, high, low, close })
    currentPrice = close
    currentTime += stepSize
  }
  
  return data
}

const initChart = () => {
  if (!chartContainer.value) return

  chartContainer.value.innerHTML = ''

  try {
    const chartInstance = createChart(chartContainer.value, {
      layout: {
        background: { type: ColorType.Solid, color: '#1f2937' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainer.value.clientWidth,
      height: props.height,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
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

    const data = generateData()
    candleSeries.setData(data)

    // Add price lines for entry
    candleSeries.createPriceLine({
      price: props.trade.open_price,
      color: props.trade.colorCode,
      lineWidth: 2,
      lineStyle: 0,
      axisLabelVisible: true,
      title: 'ENTRY',
    })

    // Add markers
    const entryTime = new Date(props.trade.open_time).getTime() / 1000
    const exitTime = new Date(props.trade.close_time).getTime() / 1000
    
    const entryCandle = data.reduce((prev, curr) => 
      Math.abs(curr.time - entryTime) < Math.abs(prev.time - entryTime) ? curr : prev
    )
    
    const exitCandle = data.reduce((prev, curr) => 
      Math.abs(curr.time - exitTime) < Math.abs(prev.time - exitTime) ? curr : prev
    )

    const isWinning = props.trade.profit_usd >= 0

    const markers: any[] = [
      {
        time: entryCandle.time,
        position: (props.trade.order_type === 'BUY' ? 'belowBar' : 'aboveBar') as any,
        color: props.trade.colorCode,
        shape: (props.trade.order_type === 'BUY' ? 'arrowUp' : 'arrowDown') as any,
        text: 'IN',
        size: 1.2,
      },
      {
        time: exitCandle.time,
        position: (isWinning 
          ? (props.trade.order_type === 'BUY' ? 'aboveBar' : 'belowBar')
          : (props.trade.order_type === 'BUY' ? 'belowBar' : 'aboveBar')) as any,
        color: isWinning ? '#10b981' : '#ef4444',
        shape: (isWinning 
          ? (props.trade.order_type === 'BUY' ? 'arrowUp' : 'arrowDown')
          : (props.trade.order_type === 'BUY' ? 'arrowDown' : 'arrowUp')) as any,
        text: 'OUT',
        size: 1.2,
      }
    ]

    createSeriesMarkers(candleSeries, markers)
    
    chart.timeScale().fitContent()
  } catch (err) {
    console.error('Error initializing mini chart:', err)
  }
}

const handleResize = () => {
  if (chart && chartContainer.value) {
    chart.applyOptions({ width: chartContainer.value.clientWidth })
  }
}

// Watch for timeframe changes
watch(() => props.timeframe, () => {
  initChart()
})

onMounted(() => {
  setTimeout(() => {
    initChart()
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
.trade-chart-mini {
  background-color: #1f2937;
  border-radius: 0.5rem;
  border: 2px solid;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.trade-chart-mini:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.chart-mini-header {
  padding: 0.75rem 1rem;
  background-color: #111827;
  border-bottom: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trade-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.symbol {
  font-weight: 700;
  font-size: 0.875rem;
  color: #e5e7eb;
}

.order-type {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.order-type.buy {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.order-type.sell {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.timeframe-badge {
  font-size: 0.7rem;
  color: #9ca3af;
  background-color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.pnl {
  font-weight: 700;
  font-size: 0.875rem;
  font-family: monospace;
}

.pnl.positive {
  color: #10b981;
}

.pnl.negative {
  color: #ef4444;
}

.chart-container {
  width: 100%;
  flex: 1;
}

.chart-mini-footer {
  padding: 0.5rem 1rem;
  background-color: #111827;
  border-top: 1px solid #374151;
  display: flex;
  gap: 1rem;
  justify-content: space-around;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: 0.65rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat .value {
  font-size: 0.75rem;
  color: #d1d5db;
  font-family: monospace;
  font-weight: 600;
}
</style>
