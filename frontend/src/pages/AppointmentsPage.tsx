import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAppointments } from '../lib/api'
import type { Appointment } from '../lib/types'
import { useAuth } from '../lib/AuthContext'
import Spinner from '../components/Spinner'
import { CalendarPlus, CalendarClock } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-clinic-teal/10 text-clinic-teal',
  completed: 'bg-clinic-border/50 text-ink/70',
  cancelled: 'bg-red-50 text-red-600',
  no_show: 'bg-clinic-amber/10 text-clinic-amber',
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const isPatient = user?.role === 'patient'

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return // wait until we actually know the user's role

    setError('')
    getAppointments(isPatient)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isPatient, authLoading])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Appointments</h1>
        <Link
          to="/dashboard/appointments/new"
          className="flex items-center gap-1.5 rounded-lg bg-clinic-teal px-4 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90"
        >
          <CalendarPlus size={16} />
          Book appointment
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-clinic-border bg-white">
        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <CalendarClock size={28} className="text-ink/30" />
            <p className="text-sm text-ink/60">No appointments yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm shadow-sm">
            <thead className="border-b border-clinic-border text-left text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Date &amp; time</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-clinic-border last:border-0 hover:bg-clinic-bg/60">
                  <td className="px-4 py-3 text-ink">
                    {new Date(a.scheduled_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{a.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}