import { apiFetch } from './apiClient'

export async function login(username: string, password: string) {
  return apiFetch('/api/auth/login/', { method: 'POST', body: { username, password } }) as Promise<{
    access: string
    refresh: string
  }>
}

export async function register(data: {
  username: string
  email: string
  password: string
  role: string
  phone_number?: string
}) {
  return apiFetch('/api/auth/register/', { method: 'POST', body: data })
}

export async function getMe() {
  return apiFetch('/api/auth/me/')
}

export async function getDoctors() {
  return apiFetch('/api/auth/doctors/')
}

export async function getPatients(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch(`/api/patients/${query}`)
}

export async function getPatient(id: number) {
  return apiFetch(`/api/patients/${id}/`)
}

export async function createPatient(data: Record<string, unknown>) {
  return apiFetch('/api/patients/', { method: 'POST', body: data })
}

export async function getAppointments(isPatient: boolean) {
  return apiFetch(isPatient ? '/api/appointments/me/' : '/api/appointments/')
}

export async function createAppointment(data: Record<string, unknown>, isPatient: boolean) {
  return apiFetch(isPatient ? '/api/appointments/me/' : '/api/appointments/', {
    method: 'POST',
    body: data,
  })
}

export async function getInvoices() {
  return apiFetch('/api/billing/invoices/')
}

export async function createInvoice(data: {
  patient: number
  notes?: string
  line_items: { description: string; quantity: number; unit_price: number }[]
}) {
  return apiFetch('/api/billing/invoices/', { method: 'POST', body: data })
}

export async function markInvoicePaid(id: number) {
  return apiFetch(`/api/billing/invoices/${id}/mark_paid/`, { method: 'POST' })
}

export async function getNotifications() {
  return apiFetch('/api/notifications/')
}

export async function markNotificationRead(id: number) {
  return apiFetch(`/api/notifications/${id}/mark_read/`, { method: 'POST' })
}

export async function getUnreadCount() {
  return apiFetch('/api/notifications/unread_count/') as Promise<{ unread_count: number }>
}

export async function getChatSessions() {
  return apiFetch('/api/ai/chat/sessions/')
}

export async function createChatSession() {
  return apiFetch('/api/ai/chat/sessions/', { method: 'POST' })
}

export async function sendChatMessage(sessionId: number, message: string) {
  return apiFetch(`/api/ai/chat/sessions/${sessionId}/messages/`, {
    method: 'POST',
    body: { message },
  })
}

export async function extractTextFromImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch('/api/ai/ocr/extract/', { method: 'POST', body: formData, isFormData: true }) as Promise<{
    extracted_text: string
  }>
}

export async function summarizeReport(reportText: string) {
  return apiFetch('/api/ai/summary/', {
    method: 'POST',
    body: { report_text: reportText },
  }) as Promise<{ summary: string }>
}