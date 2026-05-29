import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ticketsApi, projectsApi } from '../api'
import { priorityConfig, statusConfig, formatDate, formatResolutionTime } from '../utils/helpers'
import { Ticket, FolderKanban, AlertCircle, Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'
import SLAMetricsDashboard from '../components/sla/SLAMetricsDashboard'

const STATUS_BOARD = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin } = useAuthStore()

  const { data: ticketData } = useQuery({
    queryKey: ['tickets-dashboard'],
    queryFn: () => ticketsApi.getAll({ size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
  })

  const { data: openData } = useQuery({
    queryKey: ['tickets-open'],
    queryFn: () => ticketsApi.getAll({ status: 'OPEN', size: 1 }),
  })

  const { data: criticalData } = useQuery({
    queryKey: ['tickets-critical'],
    queryFn: () => ticketsApi.getAll({ priority: 'CRITICAL', size: 1 }),
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const recent = ticketData?.content ?? []

  const recentByStatus = useMemo(() => {
    return recent.reduce((acc, ticket) => {
      if (STATUS_BOARD.includes(ticket.currentStatus)) {
        acc[ticket.currentStatus].push(ticket)
      }
      return acc
    }, STATUS_BOARD.reduce((acc, status) => ({ ...acc, [status]: [] }), {}))
  }, [recent])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-600">Issue tracking</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Jira-style project overview</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">Manage issues, monitor team progress, and keep your support queues organized with a clear Jira-inspired workflow.</p>
          </div>
          <Link to="/tickets/new" className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
            <Plus size={16} /> New Ticket
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard icon={Ticket} label="Total Tickets" value={ticketData?.totalElements} color="bg-blue-600" />
        <StatCard icon={AlertCircle} label="Open Tickets" value={openData?.totalElements} color="bg-orange-500" />
        <StatCard icon={AlertCircle} label="Critical" value={criticalData?.totalElements} color="bg-red-600" />
        <StatCard icon={FolderKanban} label="Projects" value={projects?.length} color="bg-violet-600" />
      </div>

      {/* SLA Metrics Dashboard */}
      <SLAMetricsDashboard className="mb-8" />

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Current sprint board</h2>
            <p className="text-sm text-slate-500">A quick look at recent issue distribution across sprint statuses.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_BOARD.map(status => (
              <span key={status} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{statusConfig[status]?.label}</span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px] grid gap-4 md:grid-cols-4">
            {STATUS_BOARD.map(status => (
              <div key={status} className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{statusConfig[status]?.label}</p>
                  <span className="text-xs text-slate-500">{recentByStatus[status]?.length ?? 0}</span>
                </div>
                <div className="space-y-3">
                  {recentByStatus[status]?.length > 0 ? (
                    recentByStatus[status].map(ticket => (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-mono text-xs text-slate-500">{ticket.ticketId}</span>
                          <span className={statusConfig[ticket.currentStatus]?.className}>{statusConfig[ticket.currentStatus]?.label}</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-900 leading-snug">{ticket.issueDescription}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
                          <span className="badge bg-slate-100 text-slate-700">{ticket.project?.projectCode ?? 'No project'}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No recent issues</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">Recent tickets</h2>
            <p className="text-sm text-slate-500">Latest issues updated in the system.</p>
          </div>
          <Link to="/tickets" className="text-sm font-semibold text-sky-600 hover:text-sky-700">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Ticket</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Project</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Assigned</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No tickets yet</td></tr>
              )}
              {recent.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-mono text-sky-600 hover:text-sky-700 font-medium text-xs">
                      {ticket.ticketId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ticket.project?.projectCode}</td>
                  <td className="px-4 py-3">
                    <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusConfig[ticket.currentStatus]?.className}>{statusConfig[ticket.currentStatus]?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ticket.assignedTo?.name ?? <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
