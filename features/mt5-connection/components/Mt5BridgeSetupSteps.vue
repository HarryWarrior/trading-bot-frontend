<template>
  <ol class="text-left space-y-3 text-sm text-zinc-700 dark:text-zinc-300 list-decimal pl-5 max-w-xl">
    <li>{{ t('mt5b.setup.step_token') }}</li>
    <li>{{ t('mt5b.setup.step_download') }}</li>
    <li>{{ t('mt5b.setup.step_install') }}</li>
    <li class="space-y-2">
      <p>{{ t('mt5b.setup.step_whitelist') }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ t('mt5b.setup.whitelist_url_label') }}</span>
        <code
          data-testid="whitelist-url"
          class="select-all rounded-md border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-900 dark:text-zinc-100"
        >{{ apiUrl }}</code>
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ t('mt5b.setup.whitelist_note') }}</p>
    </li>
    <li>{{ t('mt5b.setup.step_attach') }}</li>
    <li>{{ t('mt5b.setup.step_inputs') }}</li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { resolveBridgeApiUrl } from '../composables/bridgeView'

const { t } = useI18n()
const config = useRuntimeConfig()
const apiUrl = computed(() =>
  resolveBridgeApiUrl(String(config.public.apiBaseUrl ?? ''), typeof window === 'undefined' ? '' : window.location.origin),
)
</script>
