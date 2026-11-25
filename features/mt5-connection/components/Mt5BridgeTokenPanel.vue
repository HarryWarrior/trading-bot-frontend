<template>
  <section class="dub-card p-6 space-y-4">
    <div>
      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ t('mt5b.tokens.title') }}</h3>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{{ t('mt5b.tokens.help') }}</p>
    </div>

    <form class="flex flex-col sm:flex-row sm:items-end gap-3" @submit.prevent="generate">
      <div class="flex-1">
        <AppInput
          v-model="name"
          :label="t('mt5b.tokens.name_label')"
          :placeholder="t('mt5b.tokens.name_placeholder')"
          :disabled="creating"
        />
      </div>
      <AppButton type="submit" :loading="creating" :disabled="!name.trim()">
        <template #startIcon><Plus class="w-4 h-4" /></template>
        {{ creating ? t('mt5b.tokens.generating') : t('mt5b.tokens.generate') }}
      </AppButton>
    </form>

    <p v-if="tokenError" role="alert" class="text-sm text-rose-600 dark:text-rose-400">{{ t(bridgeErrorKey(tokenError)) }}</p>

    <div v-if="tokensLoading && !tokens.length" class="space-y-2">
      <AppSkeleton height="h-12" />
      <AppSkeleton height="h-12" />
    </div>
    <div v-else-if="tokensLoadError" class="flex flex-wrap items-center gap-3" role="alert">
      <p class="text-sm text-rose-600 dark:text-rose-400">{{ t('mt5b.tokens.load_error') }} {{ t(bridgeErrorKey(tokensLoadError)) }}</p>
      <AppButton size="sm" variant="secondary" @click="loadTokens()">{{ t('mt5b.retry') }}</AppButton>
    </div>
    <p v-else-if="!tokens.length" class="text-sm text-zinc-500 dark:text-zinc-400">{{ t('mt5b.tokens.empty') }}</p>

    <ul v-else class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <li v-for="token in tokens" :key="token.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ token.name }}</span>
            <AppBadge :variant="token.active ? 'success' : 'neutral'" :dot="token.active">
              {{ token.active ? t('mt5b.tokens.active') : t('mt5b.tokens.revoked') }}
            </AppBadge>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ t('mt5b.tokens.created_at') }}: {{ formatStatusTime(token.createdAt) }} ·
            {{ t('mt5b.tokens.last_used') }}: {{ token.lastUsedAt ? formatStatusTime(token.lastUsedAt) : t('mt5b.tokens.never_used') }}
          </p>
        </div>
        <AppButton
          v-if="token.active"
          size="sm"
          variant="danger"
          :disabled="!!revokingId"
          @click="toRevoke = token.id"
        >
          <template #startIcon><Trash2 class="w-4 h-4" /></template>
          {{ t('mt5b.tokens.revoke') }}
        </AppButton>
      </li>
    </ul>

    <AppConfirmDeleteModal
      :is-open="!!toRevoke"
      :title="t('mt5b.tokens.revoke_title')"
      :message="t('mt5b.tokens.revoke_message')"
      :loading="!!revokingId"
      @cancel="toRevoke = null"
      @confirm="confirmRevoke"
    />
    <Mt5BridgeTokenModal />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { useI18n } from '~/composables/useI18n'
import { bridgeErrorKey } from '../composables/bridgeView'
import { formatStatusTime } from '../composables/mt5View'
import { useMt5Bridge } from '../composables/useMt5Bridge'
import Mt5BridgeTokenModal from './Mt5BridgeTokenModal.vue'

const { t } = useI18n()
const { tokens, tokensLoading, tokensLoadError, tokenError, creating, revokingId, loadTokens, createToken, revokeToken } = useMt5Bridge()
const name = ref('')
const toRevoke = ref<string | null>(null)

const generate = async () => {
  if (await createToken(name.value)) name.value = ''
}

const confirmRevoke = async () => {
  if (toRevoke.value) await revokeToken(toRevoke.value)
  toRevoke.value = null
}
</script>
