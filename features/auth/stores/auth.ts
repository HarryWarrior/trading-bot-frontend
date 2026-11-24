import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { setAuthHooks } from '~/composables/apiAuth'
import { ApiError } from '~/composables/useApiClient'
import { authApi } from '../api/authApi'
import type { AuthSession, AuthUser } from '../types'

export const REFRESH_STORAGE_KEY = 'tb.refresh'

const readRefresh = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY)
  } catch {
    return null
  }
}
const writeRefresh = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(REFRESH_STORAGE_KEY, token)
    else localStorage.removeItem(REFRESH_STORAGE_KEY)
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}

/** Session store. Access token lives in memory only; the refresh token in localStorage. */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const ready = ref(false)
  const loading = ref(false)
  /** Last `ApiError.code` (pages translate it); null when none. */
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  let inflightRefresh: Promise<boolean> | null = null
  let restoring: Promise<void> | null = null

  const applySession = (session: AuthSession) => {
    accessToken.value = session.accessToken
    user.value = session.user
    writeRefresh(session.refreshToken)
  }

  const clear = () => {
    accessToken.value = null
    user.value = null
    writeRefresh(null)
  }

  const codeOf = (err: unknown): string => (err instanceof ApiError ? err.code : 'UNKNOWN')

  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      applySession(await authApi.signIn({ email, password }))
    } catch (err) {
      error.value = codeOf(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = (): Promise<boolean> => {
    if (inflightRefresh) return inflightRefresh
    const stored = readRefresh()
    if (!stored) return Promise.resolve(false)
    inflightRefresh = (async () => {
      try {
        applySession(await authApi.refresh(stored))
        return true
      } catch (err) {
        // An unreachable server is not a verdict on the session: keep the token for the next try.
        if (!(err instanceof ApiError && err.code === 'NETWORK_ERROR')) clear()
        return false
      } finally {
        inflightRefresh = null
      }
    })()
    return inflightRefresh
  }

  const signOut = async () => {
    const stored = readRefresh()
    try {
      if (stored && accessToken.value) await authApi.signOut(stored)
    } catch {
      /* the local session is dropped regardless */
    }
    clear()
  }

  /** Client start: restore the session from the stored refresh token. Runs once. */
  const restore = (): Promise<void> => {
    if (restoring) return restoring
    restoring = (async () => {
      try {
        if (readRefresh() && (await refresh())) {
          try {
            user.value = await authApi.me()
          } catch {
            /* keep the user returned by refresh */
          }
        }
      } finally {
        ready.value = true
      }
    })()
    return restoring
  }

  /** Plug token behaviour into `useApiClient`. `onExpired` typically navigates to /login. */
  const registerHooks = (onExpired?: () => void) => {
    setAuthHooks({
      getAccessToken: () => accessToken.value,
      refresh,
      onSessionExpired: () => {
        clear()
        onExpired?.()
      },
    })
  }

  return { user, accessToken, ready, loading, error, isAuthenticated, isAdmin, signIn, refresh, signOut, restore, registerHooks }
})
