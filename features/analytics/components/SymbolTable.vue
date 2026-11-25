<template>
  <p v-if="!symbols.length" class="text-sm text-zinc-500 py-6 text-center">{{ t('analytics.symbols.empty') }}</p>
  <div v-else class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
    <table class="w-full text-sm">
      <thead class="bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 text-left">
        <tr>
          <th class="px-3 py-2">{{ t('analytics.symbols.symbol') }}</th>
          <th class="px-3 py-2 text-right">{{ t('analytics.symbols.trades') }}</th>
          <th class="px-3 py-2 text-right">{{ t('analytics.symbols.win_rate') }}</th>
          <th class="px-3 py-2 text-right">{{ t('analytics.symbols.net') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in symbols" :key="s.symbol" class="border-t border-zinc-200 dark:border-zinc-800">
          <td class="px-3 py-2 font-semibold">{{ s.symbol }}</td>
          <td class="px-3 py-2 text-right font-mono">{{ s.trades }}</td>
          <td class="px-3 py-2 text-right font-mono">{{ formatPercent(s.winRate) }}</td>
          <td class="px-3 py-2 text-right font-mono" :class="pnlClass(s.net)">{{ formatMoney(s.net) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'
import { formatPercent } from '../composables/kpi'
import type { SymbolStat } from '../types'

defineProps<{ symbols: SymbolStat[] }>()
const { t } = useI18n()
</script>
