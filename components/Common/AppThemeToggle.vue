<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center p-2 rounded-lg transition-all duration-150',
      'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900',
      'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
      'hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100',
      customClass
    ]"
    :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    @click="toggleTheme"
  >
    <!-- Sun Icon (Visible in Light Mode) -->
    <svg
      v-if="!isDark"
      class="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 hover:rotate-45"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>

    <!-- Moon Icon (Visible in Dark Mode) -->
    <svg
      v-else
      class="w-4 h-4 text-zinc-200 transition-transform duration-200 -rotate-12 hover:rotate-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

defineProps<{
  customClass?: string
}>()

const { isDark, toggleTheme } = useTheme()
</script>
