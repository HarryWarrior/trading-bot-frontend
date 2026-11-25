<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5b.accounts.title') }}</h3>
      <AppButton size="sm" variant="subtle" :loading="accountsLoading" @click="loadAccounts()">
        <template #startIcon><RefreshCw class="w-4 h-4" /></template>
        {{ t('mt5b.accounts.refresh') }}
      </AppButton>
    </div>

    <div v-if="accountsLoading && !accounts.length" class="space-y-3">
      <AppSkeleton height="h-28" />
    </div>

    <div v-else-if="accountsError" class="dub-card p-5 flex flex-wrap items-center gap-3" role="alert">
      <p class="text-sm text-rose-600 dark:text-rose-400">{{ t('mt5b.accounts.load_error') }} {{ t(bridgeErrorKey(accountsError)) }}</p>
      <AppButton size="sm" variant="secondary" @click="loadAccounts()">{{ t('mt5b.retry') }}</AppButton>
    </div>

    <AppEmptyState
      v-else-if="!accounts.length"
      :title="t('mt5b.accounts.empty_title')"
      :description="t('mt5b.accounts.empty_description')"
    >
      <template #icon><PlugZap class="w-6 h-6" /></template>
      <template #action><Mt5BridgeSetupSteps /></template>
    </AppEmptyState>

    <template v-else>
    <div v-for="account in accounts" :key="account.accountRef" class="dub-card p-5 space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{{ account.login }}</span>
        <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ account.server }}</span>
        <AppTooltip :text="t('mt5b.accounts.status_tooltip')">
          <AppBadge :variant="bridgeStatusBadge(account.status).variant" dot>{{ t(bridgeStatusBadge(account.status).key) }}</AppBadge>
        </AppTooltip>
      </div>
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <dt class="text-zinc-400"><AppTooltip :text="t('mt5b.accounts.balance_tooltip')">{{ t('mt5b.accounts.balance') }}</AppTooltip></dt>
          <dd class="font-mono text-zinc-900 dark:text-zinc-100">{{ formatStatusMoney(account.balance, true) }}</dd>
        </div>
        <div>
          <dt class="text-zinc-400"><AppTooltip :text="t('mt5b.accounts.equity_tooltip')">{{ t('mt5b.accounts.equity') }}</AppTooltip></dt>
          <dd class="font-mono text-zinc-900 dark:text-zinc-100">{{ formatStatusMoney(account.equity, true) }}</dd>
        </div>
        <div>
          <dt class="text-zinc-400">{{ t('mt5b.accounts.last_seen') }}</dt>
          <dd class="text-zinc-900 dark:text-zinc-100">{{ formatStatusTime(account.lastHeartbeat) }}</dd>
        </div>
        <div>
          <dt class="text-zinc-400">{{ t('mt5b.accounts.last_deal') }}</dt>
          <dd class="text-zinc-900 dark:text-zinc-100">{{ formatStatusTime(account.lastDealAt) }}</dd>
        </div>
      </dl>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { PlugZap, RefreshCw } from 'lucide-vue-next'
import { useI18n } from '~/composables/useI18n'
import { bridgeErrorKey, bridgeStatusBadge } from '../composables/bridgeView'
import { formatStatusMoney, formatStatusTime } from '../composables/mt5View'
import { useMt5Bridge } from '../composables/useMt5Bridge'
import Mt5BridgeSetupSteps from './Mt5BridgeSetupSteps.vue'

const { t } = useI18n()
const { accounts, accountsLoading, accountsError, loadAccounts } = useMt5Bridge()
</script>
