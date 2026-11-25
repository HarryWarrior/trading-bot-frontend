import type { BridgeAccountStatus } from '../types'

const ERROR_KEYS: Record<string, string> = {
  INVALID_TOKEN_NAME: 'mt5b.errors.invalid_token_name',
  NOT_FOUND: 'mt5b.errors.not_found',
  UNAUTHENTICATED: 'mt5b.errors.unauthenticated',
  NETWORK_ERROR: 'mt5b.errors.network',
}

export const BRIDGE_ERROR_CODES = Object.keys(ERROR_KEYS)

/** Translation key for an `ApiError.code` of the bridge (never branch on messages). */
export const bridgeErrorKey = (code: string | null | undefined): string =>
  (code && ERROR_KEYS[code]) || 'mt5b.errors.generic'

/**
 * Origin the EA calls, which the user must whitelist in MT5 (Allow WebRequest): the configured API
 * origin, or the app origin when the API is same-origin (dev proxy / gateway).
 */
export const resolveBridgeApiUrl = (apiBaseUrl: string, appOrigin: string): string => {
  if (!apiBaseUrl) return appOrigin
  try {
    return new URL(apiBaseUrl).origin
  } catch {
    return apiBaseUrl.replace(/\/+$/, '')
  }
}

export const bridgeStatusBadge = (status: BridgeAccountStatus): { variant: 'success' | 'danger'; key: string } =>
  status === 'connected'
    ? { variant: 'success', key: 'mt5b.accounts.connected' }
    : { variant: 'danger', key: 'mt5b.accounts.disconnected' }

/** Save a downloaded file through a temporary link (browser only). */
export const saveFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }
}
