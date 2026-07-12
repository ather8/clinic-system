import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createInvoice, getPatients } from '../lib/api'
import type { Patient } from '../lib/types'

type LineItemForm = { description: string; quantity: string; unit_price: string }

export default function NewInvoicePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState('')
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: '', quantity: '1', unit_price: '' },
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {})
  }, [])

  function updateLineItem(index: number, field: keyof LineItemForm, value: string) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function addLineItem() {
    setLineItems((items) => [...items, { description: '', quantity: '1', unit_price: '' }])
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index))
  }

  const total = lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (lineItems.length === 0) {
      setError('Add at least one line item.')
      return
    }

    setLoading(true)
    try {
      const invoice = await createInvoice({
        patient: Number(patientId),
        line_items: lineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      })
      navigate('/dashboard/billing')
      return invoice
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link to="/dashboard/billing" className="text-sm text-clinic-teal hover:underline">
        ← Back to billing
      </Link>

      <h1 className="mt-3 font-display text-2xl text-ink">New invoice</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-ink/80">Patient</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink/80">Line items</label>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm font-medium text-clinic-teal hover:underline"
            >
              + Add item
            </button>
          </div>

          <div className="mt-2 space-y-3">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-end gap-2 rounded-lg border border-clinic-border p-3">
                <div className="flex-1">
                  <label className="text-xs text-ink/60">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-clinic-border px-2 py-1.5 text-sm focus:border-clinic-teal focus:outline-none"
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-ink/60">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(i, 'quantity', e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-clinic-border px-2 py-1.5 text-sm focus:border-clinic-teal focus:outline-none"
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs text-ink/60">Unit price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(i, 'unit_price', e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-clinic-border px-2 py-1.5 text-sm focus:border-clinic-teal focus:outline-none"
                  />
                </div>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(i)}
                    className="mb-1.5 text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end text-sm font-medium text-ink">
            Total: ${total.toFixed(2)}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-clinic-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create invoice'}
        </button>
      </form>
    </div>
  )
}