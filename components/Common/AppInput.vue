<template>
  <div class="w-full space-y-1.5">
    <!-- Label & Optional Header Action -->
    <div v-if="label || $slots.labelAction" class="flex items-center justify-between">
      <label :for="inputId" class="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {{ label }}
        <span v-if="required" class="text-red-500 ml-0.5">*</span>
      </label>
      <slot name="labelAction" />
    </div>

    <!-- Input Wrapper -->
    <div
      :class="[
        'relative flex items-center w-full rounded-lg border transition-all duration-150',
        'bg-zinc-50/50 dark:bg-zinc-900/50',
        error
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-900 dark:focus-within:border-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10',
        disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900' : '',
        sizeWrapperClass
      ]"
    >
      <!-- Leading Icon / Slot -->
      <div v-if="$slots.leadingIcon || leadingIcon" class="pl-3 flex items-center pointer-events-none text-zinc-400">
        <slot name="leadingIcon">
          <span v-if="leadingIcon">{{ leadingIcon }}</span>
        </slot>
      </div>

      <!-- Native Input -->
      <input
        :id="inputId"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="w-full bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Password Visibility Toggle (Eye Button) -->
      <div v-if="type === 'password'" class="pr-2.5 flex items-center">
        <button
          type="button"
          :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
          class="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded focus:outline-none transition-colors"
          @click="togglePasswordVisibility"
        >
          <!-- Eye Off Icon (Masked) -->
          <svg
            v-if="isPasswordVisible"
            class="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
          <!-- Eye Icon (Visible) -->
          <svg
            v-else
            class="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      <!-- Trailing Icon / Slot -->
      <div v-else-if="$slots.trailingIcon" class="pr-3 flex items-center text-zinc-400">
        <slot name="trailingIcon" />
      </div>
    </div>

    <!-- Error or Helper Message -->
    <p v-if="error" class="text-xs text-red-500 font-medium">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-zinc-500 dark:text-zinc-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  leadingIcon?: string
  autocomplete?: string
  id?: string
}>(), {
  modelValue: '',
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
  error: '',
  hint: '',
  size: 'md',
  autocomplete: 'off',
  id: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const isPasswordVisible = ref(false)
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)

const computedType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const sizeWrapperClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-8 text-xs'
    case 'lg': return 'h-12 text-base'
    case 'md':
    default: return 'h-10 text-sm'
  }
})

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
