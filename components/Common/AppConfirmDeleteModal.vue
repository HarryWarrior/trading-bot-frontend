<template>
  <AppModal
    :is-open="isOpen"
    max-width="md"
    @close="handleCancel"
  >
    <template #header>
      <div class="flex items-center gap-3 text-red-600 dark:text-red-500">
        <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {{ title }}
          </h3>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        {{ message || 'This action cannot be undone. This will permanently remove the selected item and all associated data.' }}
      </p>

      <div v-if="confirmText" class="space-y-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60">
        <label class="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
          To confirm, type <span class="font-mono font-bold text-zinc-900 dark:text-zinc-100">{{ confirmText }}</span>:
        </label>
        <AppInput
          v-model="inputConfirmation"
          :placeholder="confirmText"
          size="sm"
        />
      </div>
    </div>

    <template #footer>
      <AppButton
        variant="secondary"
        size="sm"
        @click="handleCancel"
      >
        Cancel
      </AppButton>
      <AppButton
        variant="danger"
        size="sm"
        :disabled="isConfirmDisabled"
        :loading="loading"
        @click="handleConfirm"
      >
        <template #startIcon>
          <span>🗑️</span>
        </template>
        Confirm Delete
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'
import AppInput from './AppInput.vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  loading?: boolean
}>(), {
  title: 'Delete Confirmation',
  message: '',
  confirmText: '',
  loading: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const inputConfirmation = ref('')

watch(() => props.isOpen, (open) => {
  if (open) {
    inputConfirmation.value = ''
  }
})

const isConfirmDisabled = computed(() => {
  if (!props.confirmText) return false
  return inputConfirmation.value.trim() !== props.confirmText.trim()
})

const handleConfirm = () => {
  if (!isConfirmDisabled.value) {
    emit('confirm')
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
