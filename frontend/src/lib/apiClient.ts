import { getAccessToken, clearTokens } from './auth'

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

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const { method = 'GET', body, isFormData = false } = options

  const headers: Record<string, string> = {}

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  if (res.status === 401) {
    clearTokens()
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const firstFieldError = Object.values(data)[0]
    const message =
      data.detail ||
      (Array.isArray(firstFieldError) ? (firstFieldError[0] as string) : null) ||
      'Something went wrong.'
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return null
  return res.json()
}