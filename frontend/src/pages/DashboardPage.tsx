import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Bell, Users, Receipt, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getAppointments, getUnreadCount, getPatients, getInvoices } from '../lib/api'
import type { Appointment } from '../lib/types'
import Spinner from '../components/Spinner'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const isPatient = user?.role === 'patient'

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [patientCount, setPatientCount] = useState<number | null>(null)
  const [unpaidCount, setUnpaidCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const tasks: Promise<unknown>[] = [
      getAppointments(isPatient).then((data) => setAppointments(data)),
      getUnreadCount().then((res) => setUnreadCount(res.unread_count)),
    ]
    if (!isPatient) {
      tasks.push(getPatients().then((data) => setPatientCount(data.length)))
      tasks.push(
        getInvoices().then((data) =>
          setUnpaidCount(data.filter((inv: { status: string }) => inv.status === 'unpaid').length)
        )
      )
    }
    Promise.all(tasks).finally(() => setLoading(false))
  }, [authLoading, user, isPatient])

  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && new Date(a.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading your dashboard…" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">
        Welcome back, {user?.username}
      </h1>
      <p className="mt-1 text-sm text-ink/60 capitalize">{user?.role}</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<CalendarClock size={18} />}
          label="Upcoming"
          value={upcoming.length}
          to="/dashboard/appointments"
        />
        <StatCard
          icon={<Bell size={18} />}
          label="Unread"
          value={unreadCount}
          to="/dashboard/notifications"
        />
        {!isPatient && (
          <>
            <StatCard
              icon={<Users size={18} />}
              label="Patients"
              value={patientCount ?? 0}
              to="/dashboard/patients"
            />
            <StatCard
              icon={<Receipt size={18} />}
              label="Unpaid invoices"
              value={unpaidCount ?? 0}
              to="/dashboard/billing"
            />
          </>
        )}
      </div>

      {/* Upcoming appointments */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Upcoming appointments</h2>
          <Link
            to="/dashboard/appointments"
            className="flex items-center gap-1 text-sm font-medium text-clinic-teal hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-clinic-border bg-white shadow-sm">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <CalendarClock size={28} className="text-ink/30" />
              <p className="text-sm text-ink/60">Nothing scheduled right now.</p>
            </div>
          ) : (
            upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-b border-clinic-border px-5 py-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {new Date(a.scheduled_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/60">{a.department || 'General'}</p>
                </div>
                <span className="rounded-full bg-clinic-teal/10 px-2.5 py-1 text-xs font-medium text-clinic-teal">
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode
  label: string
  value: number
  to: string
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-clinic-border bg-white p-4 shadow-sm transition hover:border-clinic-teal/40 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-clinic-teal">{icon}</div>
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink/60">{label}</p>
    </Link>
  )
}