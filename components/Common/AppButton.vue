<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      variantClass,
      sizeClass,
      block ? 'w-full' : '',
      loading ? 'is-loading cursor-wait' : '',
      customClass
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Start Icon Slot -->
    <span v-if="$slots.startIcon && !loading" class="inline-flex shrink-0">
      <slot name="startIcon" />
    </span>

    <!-- Button Text / Content -->
    <span><slot /></span>

    <!-- End Icon Slot -->
    <span v-if="$slots.endIcon && !loading" class="inline-flex shrink-0">
      <slot name="endIcon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  customClass?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  customClass: ''
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'btn-secondary'
    case 'danger': return 'btn-danger'
    case 'success': return 'btn-success'
    case 'warning': return 'btn-warning'
    case 'subtle': return 'btn-subtle'
    case 'primary':
    default: return 'btn-primary'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-2 py-1 text-xs'
    case 'sm': return 'px-2.5 py-1.5 text-xs'
    case 'lg': return 'px-5 py-2.5 text-base'
    case 'md':
    default: return 'px-3.5 py-2 text-sm'
  }
})
</script>
