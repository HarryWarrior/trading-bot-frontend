import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { setAuthHooks, type RefreshResult } from '~/composables/apiAuth'
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

  let inflightRefresh: Promise<RefreshResult> | null = null
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

  const refresh = (): Promise<RefreshResult> => {
    if (inflightRefresh) return inflightRefresh
    const stored = readRefresh()
    if (!stored) return Promise.resolve('expired')
    inflightRefresh = (async () => {
      try {
        applySession(await authApi.refresh(stored))
        return 'ok'
      } catch (err) {
        // An unreachable server is not a verdict on the session: keep token and state for the next try.
        if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.status === 0 || err.status >= 500)) {
          return 'unavailable'
        }
        clear()
        return 'expired'
      } finally {
        inflightRefresh = null
      }
    })()
    return inflightRefresh
  }

  const signOut = async () => {
    // The refresh token in the body is the credential. If the access token expired the call 401s;
    // refresh (rotating the stored token), re-read it and retry once. Always clear locally.
    try {
      const stored = readRefresh()
      if (stored) {
        try {
          await authApi.signOut(stored)
        } catch (err) {
          if (err instanceof ApiError && err.status === 401 && (await refresh()) === 'ok') {
            const rotated = readRefresh()
            if (rotated) await authApi.signOut(rotated)
          }
        }
      }
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
        if (readRefresh() && (await refresh()) === 'ok') {
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
