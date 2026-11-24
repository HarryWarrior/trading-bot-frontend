import { getAuthHooks } from './apiAuth'

/**
 * Base HTTP client for every feature `api/` module (the frontend's outbound adapter).
 * Components and stores never call `$fetch` directly — see .agents/rules/api-client.md.
 */

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface SuccessEnvelope<T> {
  success: true
  data: T
  message: string
  meta: { timestamp: string; version: string }
}

const toApiError = (error: unknown): ApiError => {
  const fetchError = error as { status?: number; statusCode?: number; data?: { error?: ApiErrorBody } }
  const status = fetchError.status ?? fetchError.statusCode ?? 0
  const body = fetchError.data?.error
  if (body?.code) {
    return new ApiError(body.code, body.message, status, body.details)
  }
  if (status === 0) {
    return new ApiError('NETWORK_ERROR', 'The server could not be reached.', status)
  }
  return new ApiError(`HTTP_${status}`, `Request failed with status ${status}.`, status)
}

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

/** Shared by every client instance: concurrent 401s must trigger a single refresh (tokens rotate). */
let inflightRefresh: Promise<boolean> | null = null

const singleFlightRefresh = (refresh: () => Promise<boolean>): Promise<boolean> => {
  if (!inflightRefresh) {
    inflightRefresh = refresh()
      .catch(() => false)
      .finally(() => {
        inflightRefresh = null
      })
  }
  return inflightRefresh
}

interface CallOptions {
  /** Set only by the refresh call itself: any 401 means the session is over, never refresh-and-retry. */
  skipAuthRefresh?: boolean
}

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/api/${config.public.apiVersion}`

  const send = async <T>(path: string, options: FetchOptions): Promise<T> => {
    const token = getAuthHooks()?.getAccessToken() ?? null
    const headers = { ...(options.headers as Record<string, string> | undefined) }
    if (token) headers.Authorization = `Bearer ${token}`
    const envelope = await $fetch<SuccessEnvelope<T>>(path, { baseURL, ...options, headers } as never)
    return (envelope as SuccessEnvelope<T>).data
  }

  const request = async <T>(path: string, options: FetchOptions = {}, call: CallOptions = {}): Promise<T> => {
    const hooks = getAuthHooks()
    const sentToken = hooks?.getAccessToken() ?? null
    try {
      return await send<T>(path, options)
    } catch (first) {
      const error = toApiError(first)
      if (call.skipAuthRefresh) {
        if (error.status === 401) hooks?.onSessionExpired()
        throw error
      }
      if (error.code !== 'UNAUTHENTICATED' || !hooks) throw error
      // Another request may already have refreshed while this one was in flight: just retry.
      const alreadyRefreshed = hooks.getAccessToken() !== sentToken
      if (!alreadyRefreshed && !(await singleFlightRefresh(hooks.refresh))) {
        hooks.onSessionExpired()
        throw error
      }
      try {
        return await send<T>(path, options)
      } catch (second) {
        const retryError = toApiError(second)
        if (retryError.code === 'UNAUTHENTICATED') hooks.onSessionExpired()
        throw retryError
      }
    }
  }

  type Extra = Pick<FetchOptions, 'headers'> & CallOptions
  type Body = Record<string, unknown> | FormData

  return {
    get: <T>(path: string, query?: Record<string, unknown>, extra: Extra = {}) =>
      request<T>(path, { headers: extra.headers, method: 'GET', query }, extra),
    post: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { headers: extra.headers, method: 'POST', body }, extra),
    put: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { headers: extra.headers, method: 'PUT', body }, extra),
    patch: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { headers: extra.headers, method: 'PATCH', body }, extra),
    delete: <T>(path: string, query?: Record<string, unknown>, extra: Extra = {}) =>
      request<T>(path, { headers: extra.headers, method: 'DELETE', query }, extra),
  }
}
