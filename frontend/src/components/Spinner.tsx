export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink/60">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-clinic-border border-t-clinic-teal" />
      {label}
    </div>
  )
} 