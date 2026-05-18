import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ticketsApi, projectsApi } from '../api'
import { priorityConfig, statusConfig, formatDate, formatResolutionTime } from '../utils/helpers'
import { Ticket, FolderKanban, AlertCircle, Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin } = useAuthStore()

  const { data: ticketData } = useQuery({
    queryKey: ['tickets-dashboard'],
    queryFn: () => ticketsApi.getAll({ size: 5, sortBy: 'createdAt', sortDir: 'desc' }),
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your bug tracking activity</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <Plus size={16} /> New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Ticket} label="Total Tickets" value={ticketData?.totalElements} color="bg-blue-500" />
        <StatCard icon={AlertCircle} label="Open Tickets" value={openData?.totalElements} color="bg-orange-500" />
        <StatCard icon={AlertCircle} label="Critical" value={criticalData?.totalElements} color="bg-red-500" />
        <StatCard icon={FolderKanban} label="Projects" value={projects?.length} color="bg-purple-500" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Ticket ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Project</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tickets yet</td></tr>
              )}
              {recent.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-mono text-blue-600 hover:text-blue-700 font-medium text-xs">
                      {ticket.ticketId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ticket.project?.projectCode}</td>
                  <td className="px-4 py-3">
                    <span className={priorityConfig[ticket.priority]?.className}>
                      {priorityConfig[ticket.priority]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusConfig[ticket.currentStatus]?.className}>
                      {statusConfig[ticket.currentStatus]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ticket.assignedTo?.name ?? <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}