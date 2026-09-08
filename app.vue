<template>
  <div class="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

useHead({
  titleTemplate: '%s - Trading Analytics',
  meta: [
    { name: 'description', content: 'Institutional-grade Algorithmic Trading Intelligence Platform' }
  ]
})
</script>


