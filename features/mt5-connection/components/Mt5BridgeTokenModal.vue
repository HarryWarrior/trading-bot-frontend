<template>
  <AppModal
    :is-open="!!createdPlaintext"
    :title="t('mt5b.token_modal.title')"
    :close-on-backdrop="false"
    max-width="lg"
    @close="close"
  >
    <div class="space-y-4">
      <p class="text-sm text-amber-700 dark:text-amber-400" role="alert">{{ t('mt5b.token_modal.warning') }}</p>
      <p v-if="createdName" class="text-xs text-zinc-500 dark:text-zinc-400">{{ createdName }}</p>
      <div class="flex items-stretch gap-2">
        <code
          data-testid="plaintext-token"
          class="flex-1 min-w-0 break-all select-all rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-100"
        >{{ createdPlaintext }}</code>
        <AppButton variant="secondary" size="sm" @click="copy">
          <template #startIcon>
            <Check v-if="copied" class="w-4 h-4" />
            <Copy v-else class="w-4 h-4" />
          </template>
          {{ copied ? t('mt5b.token_modal.copied') : t('mt5b.token_modal.copy') }}
        </AppButton>
      </div>
      <p v-if="copyFailed" class="text-xs text-rose-600 dark:text-rose-400">{{ t('mt5b.token_modal.copy_failed') }}</p>
    </div>
    <template #footer>
      <AppButton @click="close">{{ t('mt5b.token_modal.done') }}</AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Check, Copy } from 'lucide-vue-next'
import { useI18n } from '~/composables/useI18n'
import { useMt5Bridge } from '../composables/useMt5Bridge'

const { t } = useI18n()
const { createdPlaintext, createdName, dismissCreatedToken } = useMt5Bridge()
const copied = ref(false)
const copyFailed = ref(false)

watch(createdPlaintext, () => {
  copied.value = false
  copyFailed.value = false
})

const copy = async () => {
  if (!createdPlaintext.value) return
  try {
    await navigator.clipboard.writeText(createdPlaintext.value)
    copied.value = true
    copyFailed.value = false
  } catch {
    copyFailed.value = true
  }
}

// Closing (button, Escape or the X) drops the plaintext for good: it is shown only once.
const close = () => dismissCreatedToken()

// Navigating away with the modal open also drops the plaintext (it must never be re-shown).
onBeforeUnmount(() => dismissCreatedToken())
</script>
