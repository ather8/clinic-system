import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getNotifications, markNotificationRead } from '../lib/api'
import type { Notification } from '../lib/types'
import { useOutletContext } from 'react-router-dom'
import Spinner from '../components/Spinner'

export default function NotificationsPage() {
  const { loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { refreshUnreadCount } = useOutletContext<{ refreshUnreadCount: () => void }>()

  useEffect(() => {
    if (authLoading) return

    setError('')
    getNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [authLoading])

  async function handleMarkRead(id: number) {
    setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    try {
        await markNotificationRead(id)
        refreshUnreadCount()   // ← new line, tells the layout to refetch the badge count
    } catch {
        setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
        )
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Notifications</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-xl overflow-hidden rounded-2xl border border-clinic-border bg-white">
        {loading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 border-b border-clinic-border px-5 py-4 last:border-0 ${
                n.is_read ? '' : 'bg-clinic-teal/5'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{n.title}</p>
                {n.message && <p className="mt-1 text-sm text-ink/70">{n.message}</p>}
                <p className="mt-1 text-xs text-ink/50">
                  {new Date(n.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="shrink-0 text-xs font-medium text-clinic-teal hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}