import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bug, LayoutDashboard, Ticket, Settings, LogOut, Search, Bell, Plus } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/configuration', icon: Settings, label: 'Configuration' },
]

const configSubItems = [
  { to: '/configuration/projects', label: 'Project onboarding' },
  { to: '/configuration/users', label: 'User addition' },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <Link to="/dashboard" className="inline-flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-sky-500 flex items-center justify-center shadow-sm">
                <Bug size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">BugTracker</p>
                <p className="text-base font-semibold text-slate-900">Issue Hub</p>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                    pathname.startsWith(to)
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
            <div className="relative w-full max-w-sm lg:w-80">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Search issues, projects, users..."
              />
            </div>

            <button className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <Bell size={18} />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold uppercase text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        {pathname.startsWith('/configuration') && (
          <div className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
              {configSubItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    pathname.startsWith(to)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  )
}
