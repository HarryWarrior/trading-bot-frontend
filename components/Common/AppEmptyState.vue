<template>
  <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30">
    <!-- Icon Placeholder -->
    <div class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 shadow-subtle">
      <slot name="icon">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>

    <!-- Title & Description -->
    <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
      {{ title }}
    </h3>
    <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
      {{ description }}
    </p>

    <!-- Action Button Slot -->
    <div v-if="$slots.action || actionLabel">
      <slot name="action">
        <AppButton
          v-if="actionLabel"
          variant="primary"
          size="sm"
          @click="$emit('action')"
        >
          <template #startIcon>
            <span>+</span>
          </template>
          {{ actionLabel }}
        </AppButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue'

withDefaults(defineProps<{
  title: string
  description: string
  actionLabel?: string
}>(), {
  actionLabel: ''
})

defineEmits<{
  (e: 'action'): void
}>()
</script>
