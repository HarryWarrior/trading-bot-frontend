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

// Placeholder until frontend spec 001 wires the auth store.
const getAccessToken = (): string | null => null

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

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/api/${config.public.apiVersion}`

  const request = async <T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> => {
    const token = getAccessToken()
    try {
      const envelope = await $fetch<SuccessEnvelope<T>>(path, {
        baseURL,
        ...options,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      return envelope.data
    } catch (error) {
      throw toApiError(error)
    }
  }

  return {
    get: <T>(path: string, query?: Record<string, unknown>) => request<T>(path, { method: 'GET', query }),
    post: <T>(path: string, body?: Record<string, unknown>) => request<T>(path, { method: 'POST', body }),
  }
}
