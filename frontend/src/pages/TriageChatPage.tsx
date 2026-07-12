import { useEffect, useRef, useState } from 'react'
import { createChatSession, sendChatMessage } from '../lib/api'
import type { ChatSession } from '../lib/types'
import Spinner from '../components/Spinner'

export default function TriageChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createChatSession()
      .then(setSession)
      .catch((err) => setError(err.message))
      .finally(() => setStarting(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !input.trim()) return

    const text = input.trim()
    setError('')
    

    setSending(true)
    try {
      const updated = await sendChatMessage(session.id, text)
      setSession(updated) // replaces optimistic state with the real server response (includes AI reply)
    } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong.')
    setInput(text) // put it back so the user doesn't have to retype
    } finally {
      setSending(false)
    }
  }

  if (starting) return <Spinner />

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-2xl flex-col md:h-[calc(100vh-6rem)]">
      <div>
        <h1 className="font-display text-2xl text-ink">Symptom check</h1>
        <p className="mt-1 text-sm text-ink/60">
          Tell me what's going on and I'll help point you to the right department.
          This isn't a diagnosis — for anything urgent, seek emergency care right away.
        </p>
      </div>

      {session?.department_suggestion && (
        <div className="mt-4 rounded-lg bg-clinic-teal/10 px-4 py-2 text-sm font-medium text-clinic-teal">
          Suggested department: {session.department_suggestion}
        </div>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-clinic-border bg-white p-4">
        {session?.messages.length === 0 && (
          <p className="text-sm text-ink/50">Start by describing your symptoms below.</p>
        )}
        {session?.messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-clinic-teal text-white'
                  : 'bg-clinic-bg text-ink'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-clinic-bg px-4 py-2 text-sm text-ink/50">Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms…"
          disabled={sending}
          className="flex-1 rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-lg bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  )
}