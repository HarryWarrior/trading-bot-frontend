<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        @keydown.esc="handleClose"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          @click="closeOnBackdrop ? handleClose() : null"
        />

        <!-- Modal Dialog Box -->
        <div
          :class="[
            'relative w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-modal rounded-2xl z-10 overflow-hidden',
            maxWidthClass,
            customClass
          ]"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/80">
            <slot name="header">
              <div class="space-y-0.5">
                <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {{ title }}
                </h3>
                <p v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400">
                  {{ description }}
                </p>
              </div>
            </slot>

            <button
              v-if="showCloseButton"
              type="button"
              aria-label="Close dialog"
              class="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              @click="handleClose"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 sm:p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 p-4 bg-zinc-50/60 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/80 rounded-b-2xl"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  customClass?: string
}>(), {
  title: '',
  description: '',
  maxWidth: 'md',
  showCloseButton: true,
  closeOnBackdrop: true,
  customClass: ''
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case 'md':
    default: return 'max-w-md'
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>
