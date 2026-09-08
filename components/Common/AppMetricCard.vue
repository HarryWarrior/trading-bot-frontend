<template>
  <div class="dub-card p-5 space-y-3">
    <!-- Header: Title + Tooltip & Delta -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span>{{ title }}</span>
        <AppTooltip v-if="tooltip" :text="tooltip" :title="title">
          <svg
            class="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </AppTooltip>
      </div>

      <!-- Delta Indicator / Badge -->
      <div v-if="delta !== undefined">
        <AppBadge
          :variant="isPositiveDelta ? 'success' : 'danger'"
          size="xs"
        >
          <template #startIcon>
            <span v-if="isPositiveDelta">↑</span>
            <span v-else>↓</span>
          </template>
          {{ deltaFormatted }}
        </AppBadge>
      </div>
      <div v-else-if="$slots.badge">
        <slot name="badge" />
      </div>
    </div>

    <!-- Value Display & Subtitle -->
    <div class="flex items-baseline justify-between">
      <div class="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
        {{ value }}
      </div>
      <div v-if="subtitle" class="text-xs text-zinc-400 dark:text-zinc-500">
        {{ subtitle }}
      </div>
    </div>

    <!-- Footer or Sparkline Slot -->
    <div v-if="$slots.footer" class="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppTooltip from './AppTooltip.vue'
import AppBadge from './AppBadge.vue'

const props = withDefaults(defineProps<{
  title: string
  value: string | number
  delta?: number | string
  isPositive?: boolean
  tooltip?: string
  subtitle?: string
}>(), {
  tooltip: '',
  subtitle: ''
})

const isPositiveDelta = computed(() => {
  if (props.isPositive !== undefined) return props.isPositive
  if (typeof props.delta === 'number') return props.delta >= 0
  if (typeof props.delta === 'string') return !props.delta.startsWith('-')
  return true
})

const deltaFormatted = computed(() => {
  if (props.delta === undefined) return ''
  if (typeof props.delta === 'number') {
    const sign = props.delta > 0 ? '+' : ''
    return `${sign}${props.delta.toFixed(1)}%`
  }
  return props.delta
})
</script>
