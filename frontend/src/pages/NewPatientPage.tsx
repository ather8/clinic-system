import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPatient } from '../lib/api'

export default function NewPatientPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    blood_type: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const patient = await createPatient(form)
      navigate(`/dashboard/patients/${patient.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <Link to="/dashboard/patients" className="text-sm text-clinic-teal hover:underline">
        ← Back to patients
      </Link>

      <h1 className="mt-3 font-display text-2xl text-ink">Add patient</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink/80">First name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/80">Last name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Date of birth</label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => update('date_of_birth', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Phone</label>
          <input
            type="text"
            value={form.phone_number}
            onChange={(e) => update('phone_number', e.target.value)}
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Blood type</label>
          <select
            value={form.blood_type}
            onChange={(e) => update('blood_type', e.target.value)}
            className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
          >
            <option value="">—</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-clinic-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save patient'}
        </button>
      </form>
    </div>
  )
}