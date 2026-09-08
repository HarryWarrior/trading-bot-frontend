<template>
  <div class="dub-card p-5 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span>{{ title }}</span>
        <AppTooltip v-if="subtitle" :text="subtitle" :title="title">
          <svg class="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </AppTooltip>
      </div>

      <!-- Icon / Change Pill -->
      <div v-if="change !== undefined && change !== null">
        <AppBadge
          :variant="change >= 0 ? 'success' : 'danger'"
          size="xs"
        >
          <template #startIcon>
            <span>{{ change >= 0 ? '↑' : '↓' }}</span>
          </template>
          {{ Math.abs(change) }}%
        </AppBadge>
      </div>
      <div v-else-if="icon" class="text-xs text-zinc-400">
        {{ icon }}
      </div>
    </div>

    <!-- Value -->
    <div class="flex items-baseline justify-between">
      <div class="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
        {{ formattedValue }}
      </div>
      <div v-if="trades" class="text-xs text-zinc-400 font-mono">
        {{ trades }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppTooltip from '~/components/Common/AppTooltip.vue'
import AppBadge from '~/components/Common/AppBadge.vue'

const props = defineProps<{
  title: string
  value: number | string
  change?: number
  subtitle?: string
  trades?: string
  icon?: string
  color?: string
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return props.value
})
</script>

<style scoped>
/* Component styles */
</style>
