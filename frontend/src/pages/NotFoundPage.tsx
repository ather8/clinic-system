import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-clinic-bg px-6 text-center">
      <p className="font-display text-5xl text-ink">404</p>
      <p className="mt-3 text-sm text-ink/70">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-clinic-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-clinic-teal/90"
      >
        Back home
      </Link>
    </div>
  )
}