<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="dub-card max-w-lg w-full overflow-hidden shadow-modal bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <!-- Modal Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div>
          <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🔗</span>
            <span>{{ t('mt5.connect_title') }}</span>
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {{ t('mt5.connect_subtitle') }}
          </p>
        </div>
        <button
          type="button"
          class="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleConnect">
        <!-- Account Label -->
        <AppInput
          v-model="form.account_name"
          :label="t('mt5.account_name')"
          placeholder="e.g., IC Markets Live 01"
          required
        />

        <!-- Broker Server -->
        <AppInput
          v-model="form.server"
          :label="t('mt5.server')"
          placeholder="e.g., ICMarketsSC-Live02 or RoboForex-Pro"
          required
        />

        <!-- Login / Account ID & Password -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AppInput
            v-model.number="form.login"
            type="number"
            :label="t('mt5.login')"
            placeholder="50124890"
            required
          />

          <AppInput
            v-model="form.password"
            type="password"
            :label="t('mt5.password')"
            placeholder="••••••••••••"
            required
          />
        </div>

        <!-- Feedback Messages -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <span>⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage"
          class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
        >
          <span>✓</span>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Submit & Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <AppButton
            variant="secondary"
            size="sm"
            @click="$emit('close')"
          >
            {{ t('actions.cancel') }}
          </AppButton>

          <AppButton
            type="submit"
            variant="primary"
            size="sm"
            :loading="loading"
          >
            <template #startIcon>
              <span v-if="!loading">🔗</span>
            </template>
            {{ loading ? t('actions.syncing') : t('actions.connect') }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMT5Store } from '~/stores/mt5'
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import AppInput from '~/components/Common/AppInput.vue'

const { t } = useI18n()
const mt5Store = useMT5Store()
const emit = defineEmits(['close', 'connected'])

const form = ref({
  account_name: '',
  server: '',
  login: undefined as number | undefined,
  password: '',
  broker_name: ''
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const handleConnect = async () => {
  if (!form.value.login || !form.value.server || !form.value.password) return

  loading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await mt5Store.connectAccount({
      account_name: form.value.account_name || `MT5 #${form.value.login}`,
      server: form.value.server,
      login: Number(form.value.login),
      password: form.value.password,
      broker_name: form.value.broker_name || form.value.server.split('-')[0]
    })

    successMessage.value = 'Account linked successfully! Synced deal history.'
    setTimeout(() => {
      emit('connected')
      emit('close')
    }, 1200)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to connect to MetaTrader broker server'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Component styles */
</style>
