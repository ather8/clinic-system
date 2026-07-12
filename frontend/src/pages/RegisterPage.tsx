import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../lib/api'
import { saveTokens } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
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
      await register({ username, email, password, role: 'patient' })
      // Registration doesn't return tokens, so log in right after to get one seamless flow
      const { access, refresh } = await login(username, password)
      saveTokens(access, refresh)
      await refreshUser()
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
        <h1 className="mt-4 font-display text-2xl text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Book appointments and manage your care.</p>

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
            <label className="text-sm font-medium text-ink/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={8}
              className="mt-1 w-full rounded-lg border border-clinic-border px-3 py-2 text-sm focus:border-clinic-teal focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-clinic-teal py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-clinic-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}