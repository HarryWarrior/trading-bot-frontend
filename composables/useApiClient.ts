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

  const request = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
    try {
      return await send<T>(path, options)
    } catch (first) {
      const error = toApiError(first)
      const hooks = getAuthHooks()
      if (error.code !== 'UNAUTHENTICATED' || !hooks) throw error
      let refreshed = false
      try {
        refreshed = await hooks.refresh()
      } catch {
        refreshed = false
      }
      if (!refreshed) {
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

  type Extra = Pick<FetchOptions, 'headers'>
  type Body = Record<string, unknown> | FormData

  return {
    get: <T>(path: string, query?: Record<string, unknown>, extra: Extra = {}) =>
      request<T>(path, { ...extra, method: 'GET', query }),
    post: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { ...extra, method: 'POST', body }),
    put: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { ...extra, method: 'PUT', body }),
    patch: <T>(path: string, body?: Body, extra: Extra = {}) => request<T>(path, { ...extra, method: 'PATCH', body }),
    delete: <T>(path: string, query?: Record<string, unknown>, extra: Extra = {}) =>
      request<T>(path, { ...extra, method: 'DELETE', query }),
  }
}
