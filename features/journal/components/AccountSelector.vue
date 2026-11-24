<template>
  <label class="block">
    <span v-if="label" class="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{{ label }}</span>
    <select
      :value="modelValue ?? ''"
      :disabled="loading"
      :aria-label="t('journal.accounts.label')"
      class="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      @change="onChange"
    >
      <option value="">{{ t('journal.accounts.all') }}</option>
      <option v-for="account in accounts" :key="account.accountRef" :value="account.accountRef">
        {{ optionLabel(account.accountRef) }} ({{ account.trades }})
      </option>
    </select>
    <span v-if="error" class="block text-xs text-red-500 mt-1" role="alert">{{ t('journal.accounts.error') }}</span>
  </label>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from '~/composables/useI18n'
import { useJournalAccountsStore } from '../stores/journalAccounts'
import { isUploadAccount } from '../composables/format'

/** Account filter: `null` means "All accounts". Options come from GET /journal/accounts. */
withDefaults(defineProps<{ modelValue?: string | null; label?: string }>(), { modelValue: null, label: '' })
const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const { t } = useI18n()
const store = useJournalAccountsStore()
const { accounts, loading, error } = storeToRefs(store)

const optionLabel = (ref: string) => (isUploadAccount(ref) ? t('journal.accounts.upload') : ref)

const onChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value === '' ? null : value)
}

onMounted(() => {
  if (!accounts.value.length) store.load()
})
</script>
