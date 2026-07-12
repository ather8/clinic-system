import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../lib/api'
import { saveTokens } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'


export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access, refresh } = await login(username, password)
      saveTokens(access, refresh)
      await refreshUser()   // ← new: make AuthContext actually aware of the new session
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-clinic-bg px-6">
      <div className="w-full max-w-sm rounded-2xl border border-clinic-border bg-white p-8">
        <Link to="/" className="font-display text-lg text-ink">
          Clinic System
        </Link>
        <h1 className="mt-4 font-display text-2xl text-ink">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/80">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-clinic-teal py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-clinic-teal hover:underline">
            Book as a patient
          </Link>
        </p>
      </div>
    </div>
  )
}