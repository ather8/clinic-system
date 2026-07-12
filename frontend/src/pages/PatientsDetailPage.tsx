import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPatient } from '../lib/api'
import type { Patient } from '../lib/types'
import Spinner from '../components/Spinner'

export default function PatientDetailPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPatient(Number(id))
      .then(setPatient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!patient) return null

  const fields: [string, string][] = [
    ['Date of birth', patient.date_of_birth],
    ['Phone', patient.phone_number || '—'],
    ['Address', patient.address || '—'],
    ['Blood type', patient.blood_type || '—'],
    ['Allergies', patient.allergies || '—'],
    ['Emergency contact', patient.emergency_contact_name || '—'],
    ['Emergency phone', patient.emergency_contact_phone || '—'],
  ]

  return (
    <div>
      <Link to="/dashboard/patients" className="text-sm text-clinic-teal hover:underline">
        ← Back to patients
      </Link>

      <h1 className="mt-3 font-display text-2xl text-ink">
        {patient.first_name} {patient.last_name}
      </h1>

      <div className="mt-6 max-w-xl overflow-hidden rounded-2xl border border-clinic-border bg-white">
        {fields.map(([label, value]) => (
          <div key={label} className="flex border-b border-clinic-border px-5 py-3 last:border-0">
            <span className="w-40 shrink-0 text-sm text-ink/60">{label}</span>
            <span className="text-sm text-ink">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}