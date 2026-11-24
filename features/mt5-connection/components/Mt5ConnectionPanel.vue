<template>
  <div class="space-y-6">
    <!-- Non-admin: explanation only -->
    <div v-if="view === 'readonly'" class="dub-card p-6 space-y-3">
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5c.readonly.title') }}</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ t('mt5c.readonly.body') }}</p>
      <NuxtLink to="/upload">
        <AppButton size="sm">{{ t('mt5c.readonly.cta') }}</AppButton>
      </NuxtLink>
    </div>

    <template v-else>
      <div class="dub-card p-6 space-y-3">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ t('mt5c.link.help') }}</p>
        <AppButton :loading="store.linking" @click="store.link()">
          {{ store.linking ? t('mt5c.link.linking') : t('mt5c.link.button') }}
        </AppButton>
        <p v-if="store.linkedJustNow" class="text-sm text-emerald-600 dark:text-emerald-400">
          {{ t('mt5c.link.done') }}: {{ store.linkedJustNow.login }} · {{ store.linkedJustNow.server }}
        </p>
      </div>

      <p v-if="store.error" role="alert" class="text-sm text-rose-600 dark:text-rose-400">
        {{ t(mt5ErrorKey(store.error)) }}
      </p>

      <div class="space-y-3">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5c.accounts.title') }}</h2>
        <AppSkeleton v-if="store.loading && !store.accounts.length" class="h-24 w-full" />
        <p v-else-if="!store.accounts.length && !store.error" class="text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('mt5c.accounts.empty') }}
        </p>

        <div v-for="account in store.accounts" :key="account.id" class="dub-card p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ account.name }}</span>
              <AppBadge :variant="account.tradeMode === 'real' ? 'warning' : 'info'">{{ t(tradeModeLabelKey(account.tradeMode)) }}</AppBadge>
              <AppBadge v-if="store.statusFailed[account.id]" variant="neutral">{{ t('mt5c.status.unavailable') }}</AppBadge>
              <AppBadge v-else-if="store.statuses[account.id]?.connected" variant="success" dot>{{ t('mt5c.status.connected') }}</AppBadge>
              <AppBadge v-else-if="store.statuses[account.id]" variant="danger" dot>{{ t('mt5c.status.disconnected') }}</AppBadge>
            </div>
            <div class="flex gap-2">
              <AppButton size="sm" :loading="store.syncingId === account.id" :disabled="!!store.syncingId" @click="store.sync(account.id)">
                {{ store.syncingId === account.id ? t('mt5c.sync.syncing') : t('mt5c.sync.button') }}
              </AppButton>
              <AppButton size="sm" variant="danger" :disabled="!!store.unlinkingId" @click="toUnlink = account.id">
                {{ t('mt5c.unlink.button') }}
              </AppButton>
            </div>
          </div>

          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div><dt class="text-zinc-400">{{ t('mt5c.account.login') }}</dt><dd class="font-mono text-zinc-900 dark:text-zinc-100">{{ account.login }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.account.server') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ account.server }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.account.currency') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ account.currency }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.account.company') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ account.company }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.account.linked_at') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ formatStatusTime(account.linkedAt) }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.account.last_sync') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ formatStatusTime(account.lastSyncAt) }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.status.balance') }}</dt><dd class="font-mono text-zinc-900 dark:text-zinc-100">{{ money(account.id, 'balance') }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.status.equity') }}</dt><dd class="font-mono text-zinc-900 dark:text-zinc-100">{{ money(account.id, 'equity') }}</dd></div>
            <div><dt class="text-zinc-400">{{ t('mt5c.status.as_of') }}</dt><dd class="text-zinc-900 dark:text-zinc-100">{{ formatStatusTime(store.statuses[account.id]?.connected ? store.statuses[account.id]?.asOf : null) }}</dd></div>
          </dl>

          <div v-if="store.syncResults[account.id]" class="rounded-lg border border-zinc-200 dark:border-zinc-700/60 p-3">
            <p class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{{ t('mt5c.sync.result_title') }}</p>
            <dl class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div><dt class="text-zinc-400">{{ t('mt5c.sync.created') }}</dt><dd class="font-mono">{{ store.syncResults[account.id].created }}</dd></div>
              <div><dt class="text-zinc-400">{{ t('mt5c.sync.updated') }}</dt><dd class="font-mono">{{ store.syncResults[account.id].updated }}</dd></div>
              <div><dt class="text-zinc-400">{{ t('mt5c.sync.balance_events') }}</dt><dd class="font-mono">{{ store.syncResults[account.id].balanceEvents }}</dd></div>
              <div><dt class="text-zinc-400">{{ t('mt5c.sync.open_positions') }}</dt><dd class="font-mono">{{ store.syncResults[account.id].openPositions }}</dd></div>
              <div><dt class="text-zinc-400">{{ t('mt5c.sync.skipped_positions') }}</dt><dd class="font-mono">{{ store.syncResults[account.id].skippedPositions }}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <AppConfirmDeleteModal
        :is-open="!!toUnlink"
        :title="t('mt5c.unlink.title')"
        :message="t('mt5c.unlink.message')"
        :loading="!!store.unlinkingId"
        @cancel="toUnlink = null"
        @confirm="confirmUnlink"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '~/features/auth'
import { mt5ErrorKey } from '../composables/mt5Errors'
import { formatStatusMoney, formatStatusTime, resolveMt5View, tradeModeLabelKey } from '../composables/mt5View'
import { useMt5ConnectionStore } from '../stores/mt5Connection'

const { t } = useI18n()
const auth = useAuthStore()
const store = useMt5ConnectionStore()
const view = computed(() => resolveMt5View(auth.user?.role))
const toUnlink = ref<string | null>(null)

const money = (id: string, field: 'balance' | 'equity'): string => {
  const s = store.statuses[id]
  return formatStatusMoney(s ? s[field] : null, !!s?.connected)
}

const confirmUnlink = async () => {
  if (toUnlink.value) await store.unlink(toUnlink.value)
  toUnlink.value = null
}

onMounted(() => {
  if (view.value === 'manage') void store.load()
})
</script>
