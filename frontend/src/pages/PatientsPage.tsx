import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPatients } from '../lib/api'
import type { Patient } from '../lib/types'
import Spinner from '../components/Spinner'
import { Search, UserPlus, Users } from 'lucide-react'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      getPatients(search)
        .then(setPatients)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 300) // debounce search input

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Patients</h1>
        <Link
          to="/dashboard/patients/new"
          className="flex items-center gap-1.5 rounded-lg bg-clinic-teal px-4 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90"
        >
          <UserPlus size={16} />
          Add patient
        </Link>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-clinic-border py-2 pl-9 pr-3 text-sm focus:border-clinic-teal focus:outline-none"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-clinic-border bg-white shadow-sm">
        {loading ? (
          <Spinner />
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Users size={28} className="text-ink/30" />
            <p className="text-sm text-ink/60">No patients found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-clinic-border text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Date of birth</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Blood type</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-clinic-border last:border-0 hover:bg-clinic-bg/60">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/patients/${p.id}`}
                      className="font-medium text-clinic-teal hover:underline"
                    >
                      {p.first_name} {p.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.date_of_birth}</td>
                  <td className="px-4 py-3 text-ink/70">{p.phone_number || '—'}</td>
                  <td className="px-4 py-3 text-ink/70">{p.blood_type || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}