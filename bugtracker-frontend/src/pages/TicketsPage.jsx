import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api'
import { priorityConfig, statusConfig, supportLevelConfig, formatDate, formatResolutionTime } from '../utils/helpers'
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const LEVELS = ['L1', 'L2', 'L3']

export default function TicketsPage() {
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', filters, page],
    queryFn: () => ticketsApi.getAll({ ...filters, page, size: 20 }),
  })

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val || undefined }))
    setPage(0)
  }

  const tickets = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.totalElements ?? 0} tickets found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx('btn-secondary', showFilters && 'bg-blue-50 border-blue-200 text-blue-700')}
          >
            <Filter size={15} /> Filters
          </button>
          <Link to="/tickets/new" className="btn-primary">
            <Plus size={15} /> New Ticket
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="card p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select className="input text-sm" onChange={e => setFilter('status', e.target.value)}>
              <option value="">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
            <select className="input text-sm" onChange={e => setFilter('priority', e.target.value)}>
              <option value="">All</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p]?.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Support Level</label>
            <select className="input text-sm" onChange={e => setFilter('supportLevel', e.target.value)}>
              <option value="">All</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" className="input text-sm"
              onChange={e => setFilter('fromDate', e.target.value ? e.target.value + 'T00:00:00' : '')} />
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Ticket ID', 'Project', 'Issue', 'Priority', 'Level', 'Assigned To', 'Status', 'Resolution', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading...</td></tr>
              )}
              {!isLoading && tickets.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">No tickets found</td></tr>
              )}
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-mono text-blue-600 hover:text-blue-700 font-medium text-xs">
                      {ticket.ticketId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{ticket.project?.projectCode}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{ticket.issueDescription}</td>
                  <td className="px-4 py-3">
                    <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={supportLevelConfig[ticket.supportLevel]?.className}>{ticket.supportLevel}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ticket.assignedTo?.name ?? <span className="text-gray-400 italic text-xs">Unassigned</span>}</td>
                  <td className="px-4 py-3">
                    <span className={statusConfig[ticket.currentStatus]?.className}>{statusConfig[ticket.currentStatus]?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatResolutionTime(ticket.resolutionTime)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary py-1.5 px-2.5">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-2.5">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}