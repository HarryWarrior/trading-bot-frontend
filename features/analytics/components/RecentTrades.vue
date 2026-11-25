<template>
  <div class="space-y-3">
    <div v-if="failed" class="text-sm text-red-600" role="alert">{{ t('analytics.recent.error') }}</div>
    <template v-else-if="trades.length">
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs text-zinc-500">{{ t('analytics.recent.compare_hint') }}</p>
        <AppButton size="sm" variant="secondary" :disabled="selected.length < 2" @click="showCompare = true">
          {{ t('analytics.recent.compare_open') }} ({{ selected.length }})
        </AppButton>
      </div>
      <div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="trade in trades" :key="trade.id" class="border-t first:border-t-0 border-zinc-200 dark:border-zinc-800">
              <td class="px-3 py-2">
                <input type="checkbox" :checked="selected.includes(trade.id)" :aria-label="t('analytics.recent.compare')" @change="selected = toggleSelection(selected, trade.id)" />
              </td>
              <td class="px-3 py-2 font-semibold">{{ trade.symbol }}</td>
              <td class="px-3 py-2 uppercase text-xs text-zinc-500">{{ trade.side }}</td>
              <td class="px-3 py-2 text-xs text-zinc-500 whitespace-nowrap">{{ new Date(trade.closeTime).toLocaleString() }}</td>
              <td class="px-3 py-2 text-right font-mono" :class="pnlClass(trade.net)">{{ formatMoney(trade.net) }}</td>
              <td class="px-3 py-2 text-right">
                <AppButton size="sm" variant="secondary" @click="chartTrade = trade">{{ t('analytics.recent.chart') }}</AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <TradeChartModal v-if="chartTrade" :trade="chartTrade" @close="chartTrade = null" />
    <TradeComparisonModal v-if="showCompare" :trades="selectedTrades" @close="showCompare = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'
import type { Trade } from '~/features/journal'
import { toggleSelection } from '../composables/comparison'
import TradeChartModal from './TradeChartModal.vue'
import TradeComparisonModal from './TradeComparisonModal.vue'

const props = defineProps<{ trades: Trade[]; failed?: boolean }>()
const { t } = useI18n()
const selected = ref<string[]>([])
const chartTrade = ref<Trade | null>(null)
const showCompare = ref(false)
const selectedTrades = computed(() => props.trades.filter((tr) => selected.value.includes(tr.id)))
</script>
