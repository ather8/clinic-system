import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  isFormData?: boolean
}

// Ensures concurrent 401s only trigger one refresh call, not one per failed request
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!res.ok) return false

      const data = await res.json()
      // ROTATE_REFRESH_TOKENS is on, so the response includes a new refresh token too
      saveTokens(data.access, data.refresh ?? refresh)
      return true
    } catch {
      return false
    }
  })()

  const result = await refreshPromise
  refreshPromise = null
  return result
}

function buildRequest(path: string, options: RequestOptions) {
  const { method = 'GET', body, isFormData = false } = options
  const headers: Record<string, string> = {}

  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json'

  return {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  }
}

async function parseError(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}))
  const firstFieldError = Object.values(data)[0]
  const message =
    data.detail ||
    (Array.isArray(firstFieldError) ? (firstFieldError[0] as string) : null) ||
    'Something went wrong.'
  throw new ApiError(message, res.status)
}

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, buildRequest(path, options))

  if (res.status === 401) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      // Retry the original request once, now with a fresh access token
      const retryRes = await fetch(`${API_BASE_URL}${path}`, buildRequest(path, options))
      if (retryRes.status === 401) {
        // Still unauthorized even after a successful refresh — genuinely invalid session
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth:expired'))
        throw new ApiError('Your session has expired. Please sign in again.', 401)
      }
      if (!retryRes.ok) return parseError(retryRes)
      if (retryRes.status === 204) return null
      return retryRes.json()
    }

    // Refresh token itself is missing/invalid — force full logout
    clearTokens()
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }

  if (!res.ok) return parseError(res)
  if (res.status === 204) return null
  return res.json()
}