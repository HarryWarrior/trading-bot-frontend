<template>
  <div class="app-pagination">
    <div class="pagination-info">
      <span class="text-sm text-gray-400">
        {{ t('pagination.showing') }} 
        <span class="font-medium text-white">{{ startIndex }}</span> - 
        <span class="font-medium text-white">{{ endIndex }}</span> 
        {{ t('pagination.of') }} 
        <span class="font-medium text-white">{{ totalItems }}</span>
      </span>
    </div>

    <div class="pagination-controls">
      <!-- Page Size Selector -->
      <div class="page-size-selector">
        <label class="text-xs text-gray-400 mr-2">{{ t('pagination.rows_per_page') }}:</label>
        <select 
          :value="pageSize" 
          @change="onPageSizeChange"
          class="select-control"
        >
          <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <!-- Arrow Controls -->
      <div class="flex items-center gap-1">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage <= 1"
          class="page-btn"
          :title="t('pagination.previous')"
        >
          ←
        </button>

        <span class="page-indicator">
          {{ currentPage }} / {{ totalPages || 1 }}
        </span>

        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage >= totalPages"
          class="page-btn"
          :title="t('pagination.next')"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  currentPage?: number
  pageSize?: number
  totalItems?: number
}>(), {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'change', payload: { page: number; pageSize: number }): void
}>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize) || 1)

const startIndex = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endIndex = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  emit('update:currentPage', page)
  emit('change', { page, pageSize: props.pageSize })
}

const onPageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newSize = Number(target.value)
  emit('update:pageSize', newSize)
  emit('update:currentPage', 1)
  emit('change', { page: 1, pageSize: newSize })
}
</script>

<style scoped>
.app-pagination {
  @apply flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-gray-800/80 border border-gray-700/60 rounded-lg mt-4;
}

.pagination-controls {
  @apply flex items-center gap-4 flex-wrap;
}

.select-control {
  @apply bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer;
}

.page-btn {
  @apply px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition border border-gray-600 cursor-pointer;
}

.page-indicator {
  @apply text-xs font-mono text-gray-300 px-2;
}
</style>
