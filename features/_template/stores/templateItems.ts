import { defineStore } from 'pinia'
import { ref } from 'vue'
import { templateApi } from '../api/templateApi'
import type { Pagination, TemplateItem } from '../types'

export const useTemplateItemsStore = defineStore('templateItems', () => {
  const items = ref<TemplateItem[]>([])
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async (page = 1, pageSize = 20) => {
    loading.value = true
    error.value = null
    try {
      const result = await templateApi.listItems({ page, pageSize })
      items.value = result.items
      pagination.value = result.pagination
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Unexpected error'
    } finally {
      loading.value = false
    }
  }

  const add = async (name: string) => {
    await templateApi.createItem(name)
    await load(1, pagination.value?.pageSize ?? 20)
  }

  return { items, pagination, loading, error, load, add }
})
