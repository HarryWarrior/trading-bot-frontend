import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import { createApp, ref } from 'vue'
import { resetUserStatePlugin, resetUserStores } from '~/composables/resetUserState'

describe('resetUserStores', () => {
  beforeEach(() => {
    const pinia = createPinia()
    createApp({}).use(pinia)
    pinia.use(resetUserStatePlugin)
    setActivePinia(pinia)
  })

  it('restores user-scoped stores to their initial state but leaves auth alone', () => {
    const useData = defineStore('data', () => ({ rows: ref<string[]>([]) }))
    const useAuth = defineStore('auth', () => ({ token: ref<string | null>(null) }))
    const data = useData()
    const auth = useAuth()
    data.rows = ['user A trade']
    auth.token = 'x'
    resetUserStores()
    expect(data.rows).toEqual([])
    expect(auth.token).toBe('x')
  })
})
