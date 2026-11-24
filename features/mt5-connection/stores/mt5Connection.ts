import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { mt5Api } from '../api/mt5Api'
import type { AccountStatus, Mt5Account, SyncResult } from '../types'

const codeOf = (err: unknown): string => (err instanceof ApiError ? err.code : 'UNKNOWN')

export const useMt5ConnectionStore = defineStore('mt5Connection', () => {
  const accounts = ref<Mt5Account[]>([])
  /** Live status per account id; absent = not loaded or unavailable (never fake values). */
  const statuses = ref<Record<string, AccountStatus>>({})
  const statusFailed = ref<Record<string, boolean>>({})
  const syncResults = ref<Record<string, SyncResult>>({})
  const loading = ref(false)
  const linking = ref(false)
  const syncingId = ref<string | null>(null)
  const unlinkingId = ref<string | null>(null)
  const linkedJustNow = ref<Mt5Account | null>(null)
  /** Last `ApiError.code`; the UI translates it. */
  const error = ref<string | null>(null)

  const loadStatus = async (id: string) => {
    try {
      statuses.value = { ...statuses.value, [id]: await mt5Api.getStatus(id) }
      statusFailed.value = { ...statusFailed.value, [id]: false }
    } catch {
      const { [id]: _drop, ...rest } = statuses.value
      statuses.value = rest
      statusFailed.value = { ...statusFailed.value, [id]: true }
    }
  }

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      accounts.value = await mt5Api.listAccounts()
    } catch (err) {
      accounts.value = []
      error.value = codeOf(err)
      loading.value = false
      return
    }
    loading.value = false
    await Promise.all(accounts.value.map((a) => loadStatus(a.id)))
  }

  const link = async (): Promise<boolean> => {
    linking.value = true
    error.value = null
    linkedJustNow.value = null
    try {
      const account = await mt5Api.link()
      linkedJustNow.value = account
      await load()
      return true
    } catch (err) {
      error.value = codeOf(err)
      return false
    } finally {
      linking.value = false
    }
  }

  const sync = async (id: string): Promise<boolean> => {
    syncingId.value = id
    error.value = null
    try {
      syncResults.value = { ...syncResults.value, [id]: await mt5Api.sync(id) }
      await load()
      return true
    } catch (err) {
      error.value = codeOf(err)
      return false
    } finally {
      syncingId.value = null
    }
  }

  const unlink = async (id: string): Promise<boolean> => {
    unlinkingId.value = id
    error.value = null
    try {
      await mt5Api.unlink(id)
      if (linkedJustNow.value?.id === id) linkedJustNow.value = null
      await load()
      return true
    } catch (err) {
      error.value = codeOf(err)
      return false
    } finally {
      unlinkingId.value = null
    }
  }

  return {
    accounts, statuses, statusFailed, syncResults, loading, linking, syncingId, unlinkingId, linkedJustNow, error,
    load, link, sync, unlink,
  }
})
