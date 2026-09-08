<template>
  <div
    :class="[
      'animate-pulse bg-gray-700/50 rounded',
      heightClass,
      widthClass,
      customClass
    ]"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  height?: string
  width?: string
  customClass?: string
}>(), {
  height: 'h-6',
  width: 'w-full',
  customClass: ''
})

const heightClass = computed(() => props.height)
const widthClass = computed(() => props.width)
</script>
