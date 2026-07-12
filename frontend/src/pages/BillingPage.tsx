import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getInvoices, markInvoicePaid } from '../lib/api'
import type { Invoice } from '../lib/types'
import Spinner from '../components/Spinner'
import { FilePlus, CheckCircle2, Receipt } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  unpaid: 'bg-clinic-amber/10 text-clinic-amber',
  paid: 'bg-clinic-teal/10 text-clinic-teal',
  cancelled: 'bg-clinic-border/50 text-ink/60',
}

export default function BillingPage() {
  const { loading: authLoading } = useAuth()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    setError('')
    getInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [authLoading])

  async function handleMarkPaid(id: number) {
    try {
      const updated = await markInvoicePaid(id)
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Billing</h1>
        <Link
          to="/dashboard/billing/new"
          className="flex items-center gap-1.5 rounded-lg bg-clinic-teal px-4 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90"
        >
          <FilePlus size={16} />
          New invoice
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-4">
        {loading ? (
          <Spinner />
        ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-clinic-border bg-white p-10 text-center shadow-sm">
            <Receipt size={28} className="text-ink/30" />
            <p className="text-sm text-ink/60">No invoices yet.</p>
        </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="rounded-2xl border border-clinic-border bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Invoice #{inv.id}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {new Date(inv.issued_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </div>

              <div className="mt-4 divide-y divide-clinic-border/60">
                {inv.line_items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm">
                    <span className="text-ink/70">
                      {item.description} × {item.quantity}
                    </span>
                    <span className="text-ink">${Number(item.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-clinic-border pt-3">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-sm font-medium text-ink">${Number(inv.total).toFixed(2)}</span>
              </div>

              {inv.status === 'unpaid' && (
                <button
                onClick={() => handleMarkPaid(inv.id)}
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-clinic-teal px-4 py-2 text-xs font-medium text-white hover:bg-clinic-teal/90"
                >
                <CheckCircle2 size={14} />
                Mark as paid
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}