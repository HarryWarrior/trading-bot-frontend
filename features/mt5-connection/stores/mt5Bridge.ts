import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiError } from '~/composables/useApiClient'
import { bridgeApi } from '../api/bridge'
import type { BridgeAccount, EaFile, IngestToken } from '../types'

const codeOf = (err: unknown): string => (err instanceof ApiError ? err.code : 'UNKNOWN')
const isMissing = (err: unknown): boolean => err instanceof ApiError && (err.code === 'NOT_FOUND' || err.status === 404)

/**
 * EA bridge state: ingest tokens, bridge accounts and the EA download. Available to every signed-in user.
 * The plaintext of a new token lives only in memory until the user dismisses the copy modal; it is never
 * persisted (no storage plugin) and is cleared on sign-out by the reset-user-state plugin.
 */
export const useMt5BridgeStore = defineStore('mt5Bridge', () => {
  const tokens = ref<IngestToken[]>([])
  const tokensLoading = ref(false)
  /** `ApiError.code` of the last failed token list load. */
  const tokensLoadError = ref<string | null>(null)
  /** `ApiError.code` of the last failed create/revoke. */
  const tokenError = ref<string | null>(null)
  const creating = ref(false)
  const revokingId = ref<string | null>(null)
  const createdPlaintext = ref<string | null>(null)
  const createdName = ref<string | null>(null)

  const accounts = ref<BridgeAccount[]>([])
  const accountsLoading = ref(false)
  const accountsLoaded = ref(false)
  const accountsError = ref<string | null>(null)

  const downloading = ref(false)
  const eaUnavailable = ref(false)
  const downloadError = ref<string | null>(null)

  const loadTokens = async () => {
    tokensLoading.value = true
    tokensLoadError.value = null
    try {
      tokens.value = (await bridgeApi.listTokens()).items
    } catch (err) {
      tokens.value = []
      tokensLoadError.value = codeOf(err)
    } finally {
      tokensLoading.value = false
    }
  }

  const createToken = async (name: string): Promise<boolean> => {
    if (creating.value) return false
    const clean = name.trim()
    tokenError.value = null
    if (!clean || clean.length > 100) {
      tokenError.value = 'INVALID_TOKEN_NAME'
      return false
    }
    creating.value = true
    try {
      const created = await bridgeApi.createToken(clean)
      tokens.value = [created.token, ...tokens.value.filter((t) => t.id !== created.token.id)]
      createdPlaintext.value = created.plaintext
      createdName.value = created.token.name
      return true
    } catch (err) {
      tokenError.value = codeOf(err)
      return false
    } finally {
      creating.value = false
    }
  }

  /** Called when the copy-once modal closes: the plaintext can never be shown again. */
  const dismissCreatedToken = () => {
    createdPlaintext.value = null
    createdName.value = null
  }

  const revokeToken = async (id: string): Promise<boolean> => {
    if (revokingId.value) return false
    revokingId.value = id
    tokenError.value = null
    try {
      const revoked = await bridgeApi.revokeToken(id)
      tokens.value = tokens.value.map((t) => (t.id === id ? revoked : t))
      return true
    } catch (err) {
      tokenError.value = codeOf(err)
      return false
    } finally {
      revokingId.value = null
    }
  }

  const loadAccounts = async () => {
    accountsLoading.value = true
    accountsError.value = null
    try {
      accounts.value = (await bridgeApi.listAccounts()).items
    } catch (err) {
      accounts.value = []
      accountsError.value = codeOf(err)
    } finally {
      accountsLoading.value = false
      accountsLoaded.value = true
    }
  }

  /** Returns the file to save, or null (unavailable EA or error, both reflected in state). */
  const downloadEa = async (): Promise<EaFile | null> => {
    if (downloading.value) return null
    downloading.value = true
    downloadError.value = null
    try {
      const file = await bridgeApi.downloadEa()
      eaUnavailable.value = false
      return file
    } catch (err) {
      if (isMissing(err)) eaUnavailable.value = true
      else downloadError.value = codeOf(err)
      return null
    } finally {
      downloading.value = false
    }
  }

  return {
    tokens, tokensLoading, tokensLoadError, tokenError, creating, revokingId, createdPlaintext, createdName,
    accounts, accountsLoading, accountsLoaded, accountsError,
    downloading, eaUnavailable, downloadError,
    loadTokens, createToken, dismissCreatedToken, revokeToken, loadAccounts, downloadEa,
  }
})
