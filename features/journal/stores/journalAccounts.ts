import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { journalApi } from '../api/journalApi'
import type { JournalAccount } from '../types'

export const useJournalAccountsStore = defineStore('journalAccounts', () => {
  const accounts = ref<JournalAccount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      accounts.value = await journalApi.listAccounts()
    } catch (err) {
      accounts.value = []
      error.value = err instanceof ApiError ? err.code : 'UNKNOWN'
    } finally {
      loading.value = false
    }
  }

  return { accounts, loading, error, load }
})
