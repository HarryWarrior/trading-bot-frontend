<template>
  <aside class="w-64 h-[calc(100vh-3.5rem)] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between shrink-0 select-none">
    <div class="space-y-6">
      <!-- Section: Navigation -->
      <div class="space-y-1">
        <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          {{ t('nav.workstation') }}
        </p>

        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            isActive(item.path)
              ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-base leading-none">{{ item.icon }}</span>
            <span>{{ t(item.labelKey) }}</span>
          </div>

        </NuxtLink>
      </div>
    </div>

    <!-- Bottom: Support -->
    <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <span>📖</span>
        <span>Documentation & API</span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from '#app'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()

const { t } = useI18n()

const navItems = [
  { labelKey: 'nav.dashboard', path: '/journal', icon: '📊' },
  { labelKey: 'nav.trades', path: '/trades', icon: '📓' },
  { labelKey: 'nav.upload', path: '/upload', icon: '📤' },
  { labelKey: 'nav.mt5', path: '/mt5', icon: '🔌' },
]

const isActive = (path: string) => {
  return route.path === path
}

</script>
