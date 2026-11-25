<template>
  <div class="w-full space-y-6">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-subtle mb-2 font-bold text-lg">
        ✦
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-zinc-500 dark:text-zinc-400">{{ subtitle }}</p>
    </div>
    <div class="dub-card p-6 sm:p-8 space-y-5">
      <slot />
    </div>
    <div class="text-center text-xs text-zinc-500 dark:text-zinc-400">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
