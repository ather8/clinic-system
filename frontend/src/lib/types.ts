export type Patient = {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  phone_number: string
  address: string
  blood_type: string
  allergies: string
  emergency_contact_name: string
  emergency_contact_phone: string
  user: number | null
}


export type Appointment = {
  id: number
  patient: number
  doctor: number
  department: string
  scheduled_at: string
  duration_minutes: number
  status: string
  reason: string
  notes: string
}


export type StaffUser = {
  id: number
  username: string
  role: string
}


export type Notification = {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}


export type InvoiceLineItem = {
  id: number
  description: string
  quantity: number
  unit_price: string
  line_total: string
}

export type Invoice = {
  id: number
  patient: number
  status: string
  issued_at: string
  paid_at: string | null
  notes: string
  created_by: number | null
  line_items: InvoiceLineItem[]
  total: string
}


export type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type ChatSession = {
  id: number
  department_suggestion: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}