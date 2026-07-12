import { Link } from 'react-router-dom'
import { Stethoscope, Users, CalendarCheck, MessageSquareText, WifiOff, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-clinic-bg text-ink">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="flex items-center gap-2 font-display text-xl">
          <Stethoscope size={20} className="text-clinic-teal" />
          Clinic System
        </span>
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-ink/80 hover:text-ink"
          >
            Staff sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-clinic-teal px-4 py-2 text-sm font-medium text-white hover:bg-clinic-teal/90"
          >
            Book as a patient
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-12 px-6 py-12 md:grid-cols-2 md:px-12 md:py-20">
        <div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Run your clinic.
            <br />
            From anyone's pocket.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink/70">
            Appointments, records, and billing in one place — built mobile-first,
            so your staff and your patients get the same fast experience,
            whether they're at the front desk or on the bus.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-clinic-teal px-6 py-3 text-sm font-medium text-white hover:bg-clinic-teal/90"
            >
              Book an appointment
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-clinic-border px-6 py-3 text-sm font-medium text-ink hover:bg-white"
            >
              Staff sign in
            </Link>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="w-70 rounded-[2.5rem] border-10 border-ink bg-white p-3 shadow-xl">
            <div className="rounded-[1.75rem] bg-clinic-bg p-4">
              <p className="font-display text-sm text-ink/60">Good morning, Sarah</p>
              <p className="mt-1 font-display text-lg">Your next visit</p>

              <div className="mt-4 rounded-xl border border-clinic-border bg-white p-3">
                <p className="text-xs font-medium text-clinic-teal">Tomorrow, 10:00 AM</p>
                <p className="mt-1 text-sm font-medium">Dr. Patel — General Medicine</p>
              </div>

              <div className="mt-3 rounded-xl border border-clinic-border bg-white p-3">
                <p className="text-xs font-medium text-clinic-amber">Reminder</p>
                <p className="mt-1 text-sm text-ink/70">Bring your last blood test results</p>
              </div>

              <div className="mt-4 rounded-lg bg-clinic-teal py-2 text-center text-sm font-medium text-white">
                Reschedule
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="grid grid-cols-1 gap-6 px-6 py-12 md:grid-cols-2 md:px-12">
        <div className="rounded-2xl border border-clinic-border bg-white p-8 shadow-sm">
          <Users size={22} className="text-clinic-teal" />
          <p className="mt-3 font-display text-2xl">For patients</p>
          <p className="mt-3 text-sm text-ink/70">
            Book appointments, check your records, and pay bills — all from
            your phone, without calling the front desk.
          </p>
          <Link
            to="/register"
            className="mt-5 flex items-center gap-1 text-sm font-medium text-clinic-teal hover:underline"
          >
            Create your account <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border border-clinic-border bg-white p-8 shadow-sm">
          <Stethoscope size={22} className="text-clinic-teal" />
          <p className="mt-3 font-display text-2xl">For clinic staff</p>
          <p className="mt-3 text-sm text-ink/70">
            Manage patients, appointments, and billing from one dashboard —
            built for the front desk as much as the doctor's office.
          </p>
          <Link
            to="/login"
            className="mt-5 flex items-center gap-1 text-sm font-medium text-clinic-teal hover:underline"
          >
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Feature trio */}
      <section className="px-6 py-12 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <CalendarCheck size={22} className="text-clinic-teal" />
            <p className="mt-3 font-display text-lg">Smart scheduling</p>
            <p className="mt-2 text-sm text-ink/70">
              Conflict-free booking that checks every doctor's calendar automatically.
            </p>
          </div>
          <div>
            <MessageSquareText size={22} className="text-clinic-teal" />
            <p className="mt-3 font-display text-lg">AI symptom check</p>
            <p className="mt-2 text-sm text-ink/70">
              A quick triage chat helps patients find the right department before they arrive.
            </p>
          </div>
          <div>
            <WifiOff size={22} className="text-clinic-teal" />
            <p className="mt-3 font-display text-lg">Works offline-ish</p>
            <p className="mt-2 text-sm text-ink/70">
              Installable on any phone, with the app shell cached for instant loading.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-clinic-border px-6 py-8 text-sm text-ink/60 md:px-12">
        <p>Clinic System</p>
      </footer>
    </div>
  )
}