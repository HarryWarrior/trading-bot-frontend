<template>
  <aside class="w-64 h-[calc(100vh-3.5rem)] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between shrink-0 select-none">
    <div class="space-y-6">
      <!-- Section: Navigation -->
      <div class="space-y-1">
        <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Workstation
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
            <span>{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge"
            class="text-[11px] px-1.5 py-0.5 rounded-full font-mono bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Bottom: Usage Meter & Support -->
    <div class="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-2">
        <div class="flex items-center justify-between text-xs font-medium">
          <span class="text-zinc-600 dark:text-zinc-300">Monthly Trades</span>
          <span class="text-zinc-900 dark:text-zinc-100 font-mono">{{ usageCurrent }} / {{ usageLimit }}</span>
        </div>
        <div class="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
            :style="{ width: `${usagePercentage}%` }"
          />
        </div>
      </div>

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
import { computed } from 'vue'
import { useRoute } from '#app'

const route = useRoute()

const props = withDefaults(defineProps<{
  usageCurrent?: string | number
  usageLimit?: string | number
}>(), {
  usageCurrent: "1,450",
  usageLimit: "5,000"
})

const navItems = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Journal', path: '/journal', icon: '📓', badge: 'Live' },
  { label: 'Upload Statement', path: '/upload', icon: '📤' },
]

const isActive = (path: string) => {
  return route.path === path
}

const usagePercentage = computed(() => {
  const current = Number(String(props.usageCurrent).replace(/,/g, '')) || 0
  const limit = Number(String(props.usageLimit).replace(/,/g, '')) || 100
  return Math.min(Math.round((current / limit) * 100), 100)
})
</script>
