<template>
  <div class="max-w-4xl mx-auto p-6 sm:p-10 space-y-6">
    <div class="border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{{ t('mt5c.title') }}</h1>
      <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ t('mt5c.subtitle') }}</p>
    </div>
    <Mt5ConnectionPanel />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { Mt5ConnectionPanel } from '~/features/mt5-connection'

const { t } = useI18n()
useHead({ title: 'MetaTrader 5' })
</script>
