/**
 * Tiny registry that lets the auth store plug token behaviour into `useApiClient`
 * without a circular import (store -> api -> client -> store).
 */
export interface AuthHooks {
  /** Current in-memory access token, or null when signed out. */
  getAccessToken: () => string | null
  /**
   * Try to obtain a new access token. Resolves true when a retry is worthwhile.
   * `useApiClient` single-flights this (one call for any number of concurrent 401s), skips it when
   * `getAccessToken()` already changed since the request was sent, and never uses it for the refresh
   * endpoint itself (that call passes `skipAuthRefresh`; any 401 there triggers `onSessionExpired`).
   */
  refresh: () => Promise<boolean>
  /** Called when the session cannot be recovered (refresh failed / retry still 401). */
  onSessionExpired: () => void
}

let hooks: AuthHooks | null = null

export const setAuthHooks = (next: AuthHooks): void => {
  hooks = next
}

export const getAuthHooks = (): AuthHooks | null => hooks

export const resetAuthHooks = (): void => {
  hooks = null
}
