import { Link } from 'react-router-dom'
import { FolderPlus, UserPlus } from 'lucide-react'

export default function ConfigurationPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Configuration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Project and user setup</h1>
          <p className="mt-2 text-sm text-slate-500">Manage project onboarding and add new team members from one place.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to="/configuration/projects"
          className="card group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 mb-5">
            <FolderPlus size={24} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Project onboarding</h2>
          <p className="mt-3 text-sm text-slate-500">Create new projects, manage SLA policies, and prepare your support teams for launch.</p>
        </Link>

        <Link
          to="/configuration/users"
          className="card group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 mb-5">
            <UserPlus size={24} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">User addition</h2>
          <p className="mt-3 text-sm text-slate-500">Add and configure support engineers, managers, and administrators for your workspace.</p>
        </Link>
      </div>
    </div>
  )
}
