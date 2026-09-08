<template>
  <header class="sticky top-0 z-40 w-full h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
    <!-- Left: Workspace Selector -->
    <div class="flex items-center gap-3">
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left focus-visible:outline-none"
          @click="isWorkspaceMenuOpen = !isWorkspaceMenuOpen"
        >
          <div class="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold">
            {{ workspaceName.charAt(0) }}
          </div>
          <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
            {{ workspaceName }}
          </span>
          <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            {{ planBadge }}
          </span>
          <svg class="w-3.5 h-3.5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isWorkspaceMenuOpen"
          class="absolute left-0 mt-1 w-56 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-dropdown z-50"
        >
          <div class="px-2 py-1.5 text-xs text-zinc-400 font-medium">Workspaces</div>
          <button
            class="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-zinc-900 dark:text-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80 text-left"
            @click="isWorkspaceMenuOpen = false"
          >
            <span>{{ workspaceName }}</span>
            <span class="text-emerald-500">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Center: Search Trigger (Command Palette) -->
    <div class="hidden md:flex items-center">
      <button
        type="button"
        class="flex items-center gap-3 w-64 lg:w-80 h-9 px-3 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg shadow-subtle transition-all cursor-pointer"
        @click="$emit('open-search')"
      >
        <svg class="w-3.5 h-3.5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="flex-1 text-left">Search trades, metrics, models...</span>
        <kbd class="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded">
          ⌘K
        </kbd>
      </button>
    </div>

    <!-- Right: Theme, Language & User Avatar -->
    <div class="flex items-center gap-2">
      <!-- Theme Toggle Button -->
      <AppThemeToggle />

      <!-- Language Toggle -->
      <button
        type="button"
        class="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        @click="toggleLanguage"
      >
        {{ currentLocale.toUpperCase() }}
      </button>

      <!-- User Avatar -->
      <div class="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold ring-1 ring-zinc-200 dark:ring-zinc-700 cursor-pointer shadow-subtle">
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppThemeToggle from './AppThemeToggle.vue'


const props = withDefaults(defineProps<{
  workspaceName?: string
  planBadge?: string
  userInitials?: string
}>(), {
  workspaceName: "Trading Bot HQ",
  planBadge: "PRO",
  userInitials: "HB"
})

defineEmits<{
  (e: 'open-search'): void
}>()

const { locale: currentLocale, setLocale } = useI18n()
const isWorkspaceMenuOpen = ref(false)

const toggleLanguage = () => {
  const next = currentLocale.value === 'en' ? 'es' : 'en'
  setLocale(next)
}
</script>
