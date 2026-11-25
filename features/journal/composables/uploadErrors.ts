export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const

const ERROR_KEYS: Record<string, string> = {
  DUPLICATE_IMPORT: 'journal.upload.errors.duplicate',
  UNSUPPORTED_FILE: 'journal.upload.errors.unsupported',
  FILE_TOO_LARGE: 'journal.upload.errors.too_large',
  UNREADABLE_REPORT: 'journal.upload.errors.unreadable',
  NETWORK_ERROR: 'journal.errors.network',
}

/** Translation key for an `ApiError.code` raised by the upload (never branch on messages). */
export const uploadErrorKey = (code: string | null | undefined): string =>
  (code && ERROR_KEYS[code]) || 'journal.errors.generic'

export type FileCheck = { ok: true } | { ok: false; code: 'UNSUPPORTED_FILE' | 'FILE_TOO_LARGE' }

/** Client-side check mirroring the backend limits. */
export const validateUploadFile = (file: { name: string; size: number }): FileCheck => {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) return { ok: false, code: 'UNSUPPORTED_FILE' }
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, code: 'FILE_TOO_LARGE' }
  return { ok: true }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
