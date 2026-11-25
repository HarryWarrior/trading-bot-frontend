import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '~/composables/useApiClient'
import { resetUserStatePlugin, resetUserStores } from '~/composables/resetUserState'

vi.mock('~/features/mt5-connection/api/bridge', () => ({
  bridgeApi: { createToken: vi.fn(), listTokens: vi.fn(), revokeToken: vi.fn(), listAccounts: vi.fn(), downloadEa: vi.fn() },
}))

import { bridgeApi } from '~/features/mt5-connection/api/bridge'
import { useMt5BridgeStore } from '~/features/mt5-connection/stores/mt5Bridge'

const api = bridgeApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const token = { id: 't1', name: 'Laptop', scope: 'ingest:mt5', active: true, createdAt: 'c', lastUsedAt: null, revokedAt: null }
const page = <T>(items: T[]) => ({ items, pagination: { page: 1, pageSize: 100, totalItems: items.length, totalPages: 1, hasNext: false, hasPrev: false } })

beforeEach(() => {
  const pinia = createPinia()
  createApp({}).use(pinia)
  pinia.use(resetUserStatePlugin)
  setActivePinia(pinia)
  Object.values(api).forEach((fn) => fn.mockReset())
})

describe('mt5 bridge store: tokens', () => {
  it('exposes the plaintext once after creating a token and clears it on dismiss', async () => {
    api.createToken.mockResolvedValue({ token, plaintext: 'secret-value' })
    const store = useMt5BridgeStore()
    expect(await store.createToken('  Laptop  ')).toBe(true)
    expect(api.createToken).toHaveBeenCalledWith('Laptop')
    expect(store.createdPlaintext).toBe('secret-value')
    expect(store.tokens[0]).toEqual(token)
    store.dismissCreatedToken()
    expect(store.createdPlaintext).toBeNull()
  })

  it('never writes the plaintext to browser storage', async () => {
    const setItem = vi.fn()
    const storage = { setItem, getItem: vi.fn(() => null), removeItem: vi.fn(), clear: vi.fn(), key: vi.fn(), length: 0 }
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('sessionStorage', storage)
    api.createToken.mockResolvedValue({ token, plaintext: 'secret-value' })
    const store = useMt5BridgeStore()
    await store.createToken('Laptop')
    store.dismissCreatedToken()
    expect(setItem).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('resets the plaintext and lists on sign-out / user change', async () => {
    api.createToken.mockResolvedValue({ token, plaintext: 'secret-value' })
    const store = useMt5BridgeStore()
    await store.createToken('Laptop')
    resetUserStores()
    expect(store.createdPlaintext).toBeNull()
    expect(store.tokens).toEqual([])
  })

  it('rejects an empty name without calling the api', async () => {
    const store = useMt5BridgeStore()
    expect(await store.createToken('   ')).toBe(false)
    expect(store.tokenError).toBe('INVALID_TOKEN_NAME')
    expect(api.createToken).not.toHaveBeenCalled()
  })

  it('keeps the error code and no plaintext when creation fails', async () => {
    api.createToken.mockRejectedValue(new ApiError('INVALID_TOKEN_NAME', 'x', 400))
    const store = useMt5BridgeStore()
    expect(await store.createToken('Laptop')).toBe(false)
    expect(store.tokenError).toBe('INVALID_TOKEN_NAME')
    expect(store.createdPlaintext).toBeNull()
  })

  it('ignores a second create while one is running', async () => {
    let release: (v: unknown) => void = () => {}
    api.createToken.mockReturnValue(new Promise((r) => (release = r)))
    const store = useMt5BridgeStore()
    const first = store.createToken('A')
    expect(await store.createToken('B')).toBe(false)
    release({ token, plaintext: 'p' })
    await first
    expect(api.createToken).toHaveBeenCalledTimes(1)
  })

  it('loads tokens and replaces a token with its revoked version', async () => {
    api.listTokens.mockResolvedValue(page([token]))
    api.revokeToken.mockResolvedValue({ ...token, active: false, revokedAt: 'r' })
    const store = useMt5BridgeStore()
    await store.loadTokens()
    expect(store.tokens).toHaveLength(1)
    expect(await store.revokeToken('t1')).toBe(true)
    expect(store.tokens[0]).toMatchObject({ id: 't1', active: false, revokedAt: 'r' })
    expect(store.revokingId).toBeNull()
  })

  it('reports a revoke failure by code', async () => {
    api.listTokens.mockResolvedValue(page([token]))
    api.revokeToken.mockRejectedValue(new ApiError('NOT_FOUND', 'x', 404))
    const store = useMt5BridgeStore()
    await store.loadTokens()
    expect(await store.revokeToken('t1')).toBe(false)
    expect(store.tokenError).toBe('NOT_FOUND')
    expect(store.tokens[0].active).toBe(true)
  })

  it('keeps a load error for tokens', async () => {
    api.listTokens.mockRejectedValue(new ApiError('NETWORK_ERROR', 'x', 0))
    const store = useMt5BridgeStore()
    await store.loadTokens()
    expect(store.tokensLoadError).toBe('NETWORK_ERROR')
    expect(store.tokens).toEqual([])
  })
})

describe('mt5 bridge store: accounts', () => {
  it('loads accounts and keeps the error code on failure', async () => {
    const account = { accountRef: '1@s', login: 1, server: 's', status: 'connected' }
    api.listAccounts.mockResolvedValueOnce(page([account]))
    const store = useMt5BridgeStore()
    await store.loadAccounts()
    expect(store.accounts).toEqual([account])
    expect(store.accountsLoading).toBe(false)
    api.listAccounts.mockRejectedValueOnce(new ApiError('HTTP_502', 'x', 502))
    await store.loadAccounts()
    expect(store.accountsError).toBe('HTTP_502')
    expect(store.accounts).toEqual([])
  })
})

describe('mt5 bridge store: EA download', () => {
  it('returns the file when the EA exists', async () => {
    const file = { blob: new Blob(['x']), fileName: 'TradingJournalBridge.ex5' }
    api.downloadEa.mockResolvedValue(file)
    const store = useMt5BridgeStore()
    expect(await store.downloadEa()).toBe(file)
    expect(store.eaUnavailable).toBe(false)
    expect(store.downloadError).toBeNull()
  })

  it('marks the EA as unavailable on NOT_FOUND instead of failing', async () => {
    api.downloadEa.mockRejectedValue(new ApiError('NOT_FOUND', 'The EA has not been built yet', 404))
    const store = useMt5BridgeStore()
    expect(await store.downloadEa()).toBeNull()
    expect(store.eaUnavailable).toBe(true)
    expect(store.downloadError).toBeNull()
    expect(store.downloading).toBe(false)
  })

  it('treats a bare 404 as unavailable too', async () => {
    api.downloadEa.mockRejectedValue(new ApiError('HTTP_404', 'x', 404))
    const store = useMt5BridgeStore()
    await store.downloadEa()
    expect(store.eaUnavailable).toBe(true)
  })

  it('keeps other failures as a download error', async () => {
    api.downloadEa.mockRejectedValue(new ApiError('NETWORK_ERROR', 'x', 0))
    const store = useMt5BridgeStore()
    expect(await store.downloadEa()).toBeNull()
    expect(store.eaUnavailable).toBe(false)
    expect(store.downloadError).toBe('NETWORK_ERROR')
  })
})
