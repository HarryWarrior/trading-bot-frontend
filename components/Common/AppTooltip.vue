<template>
  <div class="relative inline-flex items-center group cursor-help">
    <slot />
    
    <!-- Tooltip Floating Bubble -->
    <div
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none"
    >
      <div class="bg-gray-900 text-gray-200 text-xs rounded-md py-1.5 px-3 shadow-xl border border-gray-700 max-w-xs text-center whitespace-normal leading-relaxed">
        <span v-if="title" class="font-bold text-blue-400 block mb-0.5">{{ title }}</span>
        <span>{{ text }}</span>
      </div>
      <!-- Triangle pointer -->
      <div class="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45 -mt-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  title?: string
}>()
</script>
