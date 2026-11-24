<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppMetricCard
      v-for="kpi in kpis"
      :key="kpi.key"
      :title="t(`analytics.kpi.${kpi.key}`)"
      :value="kpi.value"
      :subtitle="subtitle(kpi)"
      :tooltip="t(kpi.tooltipKey)"
    >
      <template #badge>
        <span :class="toneClass(kpi.tone)" class="text-xs font-semibold">{{ kpi.tone === 'positive' ? '▲' : kpi.tone === 'negative' ? '▼' : '' }}</span>
      </template>
    </AppMetricCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppMetricCard from '~/components/Common/AppMetricCard.vue'
import { buildKpis } from '../composables/kpi'
import type { Kpi, KpiTone, Summary } from '../types'

const props = defineProps<{ summary: Summary }>()
const { t } = useI18n()
const kpis = computed(() => buildKpis(props.summary))

const subtitle = (kpi: Kpi) => (kpi.key === 'win_streak' ? `${kpi.subtitle} ${t('analytics.kpi.loss_streak')}` : kpi.subtitle)
const toneClass = (tone: KpiTone) =>
  tone === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'negative' ? 'text-rose-600 dark:text-rose-400' : ''
</script>
