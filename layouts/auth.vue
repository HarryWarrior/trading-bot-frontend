<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center p-6">
    <div class="absolute top-4 right-4 flex items-center gap-2">
      <AppThemeToggle />
      <button
        type="button"
        class="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        @click="setLocale(locale === 'en' ? 'es' : 'en')"
      >
        {{ locale.toUpperCase() }}
      </button>
    </div>
    <div class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { locale, setLocale } = useI18n()
</script>
