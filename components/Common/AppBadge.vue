<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
      variantClasses,
      sizeClasses,
      customClass
    ]"
  >
    <!-- Dot Indicator -->
    <span
      v-if="dot"
      :class="['w-1.5 h-1.5 rounded-full shrink-0', dotClass]"
    />

    <!-- Start Icon Slot -->
    <slot name="startIcon" />

    <!-- Badge Text Content -->
    <span><slot /></span>

    <!-- End Icon Slot -->
    <slot name="endIcon" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'primary'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  customClass?: string
}>(), {
  variant: 'neutral',
  size: 'sm',
  dot: false,
  customClass: ''
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
    case 'danger':
      return 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40'
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
    case 'info':
      return 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40'
    case 'primary':
      return 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
    case 'neutral':
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700'
  }
})

const dotClass = computed(() => {
  switch (props.variant) {
    case 'success': return 'bg-emerald-500'
    case 'danger': return 'bg-red-500'
    case 'warning': return 'bg-amber-500'
    case 'info': return 'bg-sky-500'
    case 'primary': return 'bg-white dark:bg-zinc-900'
    case 'neutral':
    default: return 'bg-zinc-400'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-2 py-0.5 text-[10px]'
    case 'md': return 'px-3 py-1 text-xs'
    case 'sm':
    default: return 'px-2.5 py-0.5 text-xs'
  }
})
</script>
