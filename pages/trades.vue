<template>
  <div class="max-w-6xl mx-auto p-6 sm:p-10 space-y-6">
    <div class="border-b border-zinc-200 dark:border-zinc-800 pb-5 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{{ t('journal.trades.title') }}</h1>
        <p class="text-xs sm:text-sm text-zinc-500 mt-1">{{ t('journal.trades.subtitle') }}</p>
      </div>
      <NuxtLink to="/upload">
        <AppButton size="sm">{{ t('actions.upload') }}</AppButton>
      </NuxtLink>
    </div>
    <TradesPanel />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import { TradesPanel } from '~/features/journal'

const { t } = useI18n()
useHead({ title: 'Trades' })
</script>
