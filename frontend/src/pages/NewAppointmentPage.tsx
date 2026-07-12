import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createAppointment, getPatients, getDoctors } from '../lib/api'
import type { Patient, StaffUser } from '../lib/types'
import { useAuth } from '../lib/AuthContext'

export default function NewAppointmentPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<StaffUser[]>([])
  const { user } = useAuth()
  const isPatient = user?.role === 'patient'
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    department: '',
    scheduled_at: '',
    duration_minutes: '30',
    reason: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {})
    getDoctors().then(setDoctors).catch(() => {})
  }, [])

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createAppointment({
        ...form,
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        duration_minutes: Number(form.duration_minutes),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      }, isPatient)
      navigate('/dashboard/appointments')
    } catch (err) {
      // This is where the backend's conflict-detection message surfaces directly
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <Link to="/dashboard/appointments" className="text-sm text-clinic-teal hover:underline">
        ← Back to appointments
      </Link>

      <h1 className="mt-3 font-display text-2xl text-ink">Book appointment</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink/80">Patient</label>
          <select
            value={form.patient}
            onChange={(e) => update('patient', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          >
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Doctor</label>
          <select
            value={form.doctor}
            onChange={(e) => update('doctor', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Department</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Date &amp; time</label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => update('scheduled_at', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Reason</label>
          <textarea
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-clinic-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
        >
          {loading ? 'Booking…' : 'Book appointment'}
        </button>
      </form>
    </div>
  )
}