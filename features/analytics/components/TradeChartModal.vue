<template>
  <AppModal :is-open="true" :title="`${trade.symbol} ${trade.side.toUpperCase()}`" max-width="2xl" @close="$emit('close')">
    <div class="space-y-3">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="tf in timeframes"
          :key="tf"
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-semibold border"
          :class="tf === timeframe ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'"
          @click="timeframe = tf"
        >
          {{ tf }}
        </button>
      </div>
      <TradeChart :trade="trade" :timeframe="timeframe" />
      <dl class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div><dt class="text-zinc-500">{{ t('analytics.trade.entry') }}</dt><dd class="font-mono">{{ trade.openPrice }}</dd></div>
        <div><dt class="text-zinc-500">{{ t('analytics.trade.exit') }}</dt><dd class="font-mono">{{ trade.closePrice }}</dd></div>
        <div v-if="trade.stopLoss !== null"><dt class="text-zinc-500">{{ t('analytics.trade.sl') }}</dt><dd class="font-mono text-rose-500">{{ trade.stopLoss }}</dd></div>
        <div v-if="trade.takeProfit !== null"><dt class="text-zinc-500">{{ t('analytics.trade.tp') }}</dt><dd class="font-mono text-emerald-500">{{ trade.takeProfit }}</dd></div>
        <div><dt class="text-zinc-500">{{ t('analytics.trade.net') }}</dt><dd class="font-mono font-bold" :class="pnlClass(trade.net)">{{ formatMoney(trade.net) }}</dd></div>
      </dl>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppModal from '~/components/Common/AppModal.vue'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'
import type { Trade } from '~/features/journal'
import TradeChart from './TradeChart.vue'

defineProps<{ trade: Trade }>()
defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1']
const timeframe = ref('M5')
</script>
