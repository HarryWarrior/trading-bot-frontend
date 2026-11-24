<template>
  <div class="space-y-2">
    <div v-if="loading" class="h-16 flex items-center justify-center text-xs text-zinc-500">{{ t('market.loading') }}</div>
    <div v-else-if="errorCode" class="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center" role="status">
      <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ t('market.empty') }}</p>
      <p class="text-xs text-zinc-500 mt-1">{{ t(marketErrorKey(errorCode)) }}</p>
    </div>
    <div v-show="!loading && !errorCode" ref="container" class="w-full rounded-lg overflow-hidden" :style="{ height: `${height}px` }"></div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ColorType, CandlestickSeries, CrosshairMode, createChart, createSeriesMarkers } from 'lightweight-charts'
import { useI18n } from '~/composables/useI18n'
import { marketErrorKey, useCandles } from '~/features/market'
import type { Trade } from '~/features/journal'

/** Real candles for one trade. Stop loss / take profit lines are drawn only when the trade carries them. */
const props = withDefaults(defineProps<{ trade: Trade; timeframe?: string; height?: number; count?: number }>(), {
  timeframe: 'M5',
  height: 380,
  count: 500,
})

const { t } = useI18n()
const { candles, loading, errorCode, load } = useCandles()
const container = ref<HTMLElement | null>(null)
let chart: any = null

const seconds = (iso: string) => Math.floor(new Date(iso).getTime() / 1000)

const destroy = () => {
  if (chart) {
    chart.remove()
    chart = null
  }
}

const render = () => {
  destroy()
  if (!container.value || !candles.value.length) return
  const tr = props.trade
  const first = candles.value[0].time
  const last = candles.value[candles.value.length - 1].time
  if (seconds(tr.closeTime) < first || seconds(tr.openTime) > last) {
    errorCode.value = 'OUT_OF_RANGE'
    return
  }
  const dark = document.documentElement.classList.contains('dark')
  chart = markRaw(
    createChart(container.value, {
      layout: { background: { type: ColorType.Solid, color: dark ? '#09090b' : '#ffffff' }, textColor: dark ? '#a1a1aa' : '#52525b' },
      grid: { vertLines: { color: 'rgba(113,113,122,0.2)' }, horzLines: { color: 'rgba(113,113,122,0.2)' } },
      width: container.value.clientWidth,
      height: props.height,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false },
    }),
  )
  const series = chart.addSeries(CandlestickSeries, {
    upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
  })
  series.setData(candles.value.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })))
  series.createPriceLine({ price: tr.openPrice, color: '#fbbf24', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: 'ENTRY' })
  if (tr.stopLoss !== null) series.createPriceLine({ price: tr.stopLoss, color: '#ef4444', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'SL' })
  if (tr.takeProfit !== null) series.createPriceLine({ price: tr.takeProfit, color: '#10b981', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'TP' })

  const nearest = (target: number) => candles.value.reduce((p, c) => (Math.abs(c.time - target) < Math.abs(p.time - target) ? c : p))
  const buy = tr.side.toLowerCase() === 'buy'
  const win = tr.net >= 0
  const markers = [
    { time: nearest(seconds(tr.openTime)).time, position: buy ? 'belowBar' : 'aboveBar', color: '#fbbf24', shape: buy ? 'arrowUp' : 'arrowDown', text: 'ENTRY' },
    { time: nearest(seconds(tr.closeTime)).time, position: buy ? 'aboveBar' : 'belowBar', color: win ? '#10b981' : '#ef4444', shape: buy ? 'arrowDown' : 'arrowUp', text: 'EXIT' },
  ].sort((a, b) => a.time - b.time)
  createSeriesMarkers(series, markers as any)
  chart.timeScale().fitContent()
}

const reload = async () => {
  await load(props.trade.symbol, props.timeframe, props.count)
  await new Promise((r) => setTimeout(r, 0)) // let v-show reveal the container before measuring it
  render()
}

watch(() => [props.trade.id, props.timeframe], reload)
onMounted(reload)
onBeforeUnmount(destroy)
</script>
