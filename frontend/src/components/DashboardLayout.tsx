import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useEffect, useState } from 'react'
import { getUnreadCount } from '../lib/api'
import { LayoutDashboard, Users, CalendarClock, Receipt, Bell, MessageSquareText, FileText, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STAFF_ROLES = ['admin', 'doctor', 'nurse', 'receptionist']

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; roles: string[] }[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { to: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarClock, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { to: '/dashboard/billing', label: 'Billing', icon: Receipt, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { to: '/dashboard/symptom-check', label: 'Symptom check', icon: MessageSquareText, roles: ['patient'] },
  { to: '/dashboard/document-tools', label: 'Document tools', icon: FileText, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  function refreshUnreadCount() {
    getUnreadCount()
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {})
  }

  useEffect(() => {
    if (!user) return
    refreshUnreadCount()
  }, [user])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="flex min-h-screen bg-clinic-bg">
      {/* Sidebar - hidden on mobile, becomes a bottom bar there instead */}
      <aside className="hidden w-56 shrink-0 border-r border-clinic-border bg-white md:block">
        <div className="px-6 py-5">
          <span className="font-display text-lg text-ink">Clinic System</span>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-clinic-teal/10 text-clinic-teal'
                    : 'text-ink/70 hover:bg-clinic-bg hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  {item.label}
                </span>
                {item.to === '/dashboard/notifications' && unreadCount > 0 && (
                  <span className="rounded-full bg-clinic-amber px-1.5 py-0.5 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-clinic-border bg-white px-6 py-4">
          <span className="font-display text-lg text-ink md:hidden">Clinic System</span>
          <span className="text-sm text-ink/60">
            {user ? `${user.username} · ${user.role}` : ''}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </header>

        <main className="px-6 py-8 pb-20 md:pb-8">
          <Outlet context={{ refreshUnreadCount }} />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-clinic-border bg-white md:hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-clinic-teal' : 'text-ink/60'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}