<template>
  <div class="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
    <header class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ t('analytics.title') }}</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{{ t('analytics.subtitle') }}</p>
      </div>
      <NuxtLink to="/upload">
        <AppButton variant="secondary" size="sm">{{ t('nav.upload') }}</AppButton>
      </NuxtLink>
    </header>
    <AnalyticsDashboard />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import { AnalyticsDashboard } from '~/features/analytics'

const { t } = useI18n()
useHead({ title: 'Dashboard' })
</script>
