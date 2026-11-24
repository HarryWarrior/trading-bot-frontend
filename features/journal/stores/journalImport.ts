import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { journalApi } from '../api/journalApi'
import { validateUploadFile } from '../composables/uploadErrors'
import type { ImportResult } from '../types'

export const useJournalImportStore = defineStore('journalImport', () => {
  const result = ref<ImportResult | null>(null)
  const loading = ref(false)
  /** Last `ApiError.code` (or client-side validation code); the UI translates it. */
  const error = ref<string | null>(null)
  /** DUPLICATE_IMPORT: id of the import already stored. */
  const duplicateImportId = ref<string | null>(null)
  /** UNREADABLE_REPORT: backend-provided reason. */
  const errorReason = ref<string | null>(null)

  const reset = () => {
    result.value = null
    error.value = null
    duplicateImportId.value = null
    errorReason.value = null
  }

  const upload = async (file: File): Promise<boolean> => {
    reset()
    const check = validateUploadFile(file)
    if (!check.ok) {
      error.value = check.code
      return false
    }
    loading.value = true
    try {
      result.value = await journalApi.uploadReport(file)
      return true
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.code
        const details = (err.details ?? {}) as { import_id?: string; reason?: string }
        duplicateImportId.value = details.import_id ?? null
        errorReason.value = details.reason ?? null
      } else {
        error.value = 'UNKNOWN'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  return { result, loading, error, duplicateImportId, errorReason, upload, reset }
})
