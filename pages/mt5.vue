<template>
  <div class="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
    <section class="space-y-6">
      <div class="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{{ t('mt5b.title') }}</h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ t('mt5b.subtitle') }}</p>
      </div>
      <Mt5BridgePanel />
    </section>

    <section class="space-y-6 pt-6 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
      <div>
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5b.legacy.title') }}</h2>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ t('mt5b.legacy.subtitle') }}</p>
      </div>
      <Mt5ConnectionPanel />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { Mt5BridgePanel, Mt5ConnectionPanel } from '~/features/mt5-connection'

const { t } = useI18n()
useHead({ title: 'MetaTrader 5' })
</script>
