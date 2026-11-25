<template>
  <section class="dub-card p-6 space-y-3">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5b.ea.title') }}</h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ t('mt5b.ea.help') }}</p>
      </div>
      <AppButton variant="secondary" :loading="downloading" @click="downloadEa()">
        <template #startIcon><Download class="w-4 h-4" /></template>
        {{ downloading ? t('mt5b.ea.downloading') : t('mt5b.ea.download') }}
      </AppButton>
    </div>

    <div
      v-if="eaUnavailable"
      class="flex gap-3 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3"
      role="status"
    >
      <Info class="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p class="text-sm font-medium text-amber-800 dark:text-amber-300">{{ t('mt5b.ea.unavailable_title') }}</p>
        <p class="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">{{ t('mt5b.ea.unavailable_body') }}</p>
      </div>
    </div>
    <p v-else-if="downloadError" role="alert" class="text-sm text-rose-600 dark:text-rose-400">{{ t(bridgeErrorKey(downloadError)) }}</p>
  </section>
</template>

<script setup lang="ts">
import { Download, Info } from 'lucide-vue-next'
import { useI18n } from '~/composables/useI18n'
import { bridgeErrorKey } from '../composables/bridgeView'
import { useMt5Bridge } from '../composables/useMt5Bridge'

const { t } = useI18n()
// downloadEa saves the file via saveFile; an unavailable EA (404 NOT_FOUND) only sets eaUnavailable.
const { downloading, eaUnavailable, downloadError, downloadEa } = useMt5Bridge()
</script>
