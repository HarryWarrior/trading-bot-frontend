import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '~/composables/useApiClient'

vi.mock('~/features/mt5-connection/api/mt5Api', () => ({
  mt5Api: { link: vi.fn(), listAccounts: vi.fn(), getStatus: vi.fn(), sync: vi.fn(), unlink: vi.fn() },
}))

import { mt5Api } from '~/features/mt5-connection/api/mt5Api'
import { useMt5ConnectionStore } from '~/features/mt5-connection/stores/mt5Connection'

const api = mt5Api as unknown as Record<string, ReturnType<typeof vi.fn>>
const account = { id: 'a1', login: 1, server: 's' }

beforeEach(() => {
  setActivePinia(createPinia())
  Object.values(api).forEach((fn) => fn.mockReset())
  api.listAccounts.mockResolvedValue([account])
})

describe('mt5 connection store', () => {
  it('refreshes the account status after a failed sync so no stale "Connected" remains', async () => {
    api.getStatus.mockResolvedValueOnce({ connected: true, balance: 100, equity: 100 })
    const store = useMt5ConnectionStore()
    await store.load()
    expect(store.statuses.a1.connected).toBe(true)
    api.sync.mockRejectedValue(new ApiError('TERMINAL_NOT_AVAILABLE', 'x', 503))
    api.getStatus.mockRejectedValueOnce(new ApiError('TERMINAL_NOT_AVAILABLE', 'x', 503))
    expect(await store.sync('a1')).toBe(false)
    expect(store.error).toBe('TERMINAL_NOT_AVAILABLE')
    expect(store.statuses.a1).toBeUndefined()
    expect(store.statusFailed.a1).toBe(true)
  })

  it('ignores a second sync while one is running', async () => {
    let release: (v: unknown) => void = () => {}
    api.sync.mockReturnValue(new Promise((r) => (release = r)))
    api.getStatus.mockResolvedValue({ connected: true })
    const store = useMt5ConnectionStore()
    const first = store.sync('a1')
    expect(await store.sync('a1')).toBe(false)
    release({})
    await first
    expect(api.sync).toHaveBeenCalledTimes(1)
  })

  it('ignores a second link while linking and a second unlink while unlinking', async () => {
    let r1: (v: unknown) => void = () => {}
    let r2: (v: unknown) => void = () => {}
    api.link.mockReturnValue(new Promise((r) => (r1 = r)))
    api.unlink.mockReturnValue(new Promise((r) => (r2 = r)))
    api.getStatus.mockResolvedValue({ connected: true })
    const store = useMt5ConnectionStore()
    const l = store.link()
    await store.link()
    const u = store.unlink('a1')
    await store.unlink('a1')
    r1(account)
    r2({})
    await Promise.all([l, u])
    expect(api.link).toHaveBeenCalledTimes(1)
    expect(api.unlink).toHaveBeenCalledTimes(1)
  })
})
