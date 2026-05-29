import { useState, useMemo } from 'react'
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

  const groupedTickets = useMemo(() => {
    const groups = STATUSES.reduce((acc, status) => ({ ...acc, [status]: [] }), {})
    tickets.forEach(ticket => {
      if (groups[ticket.currentStatus]) {
        groups[ticket.currentStatus].push(ticket)
      }
    })
    return groups
  }, [tickets])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Issue queue</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tickets</h1>
          <p className="mt-2 text-sm text-slate-500">A Jira-like board for issue tracking and team workflows.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx('btn-secondary inline-flex items-center gap-2', showFilters && 'bg-slate-100 border-slate-300 text-slate-900')}
          >
            <Filter size={15} /> Filters
          </button>
          <Link to="/tickets/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> New Ticket
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Status</label>
              <select className="input text-sm" onChange={e => setFilter('status', e.target.value)}>
                <option value="">All</option>
                {STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Priority</label>
              <select className="input text-sm" onChange={e => setFilter('priority', e.target.value)}>
                <option value="">All</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p]?.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Support Level</label>
              <select className="input text-sm" onChange={e => setFilter('supportLevel', e.target.value)}>
                <option value="">All</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">From Date</label>
              <input type="date" className="input text-sm" onChange={e => setFilter('fromDate', e.target.value ? e.target.value + 'T00:00:00' : '')} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm overflow-x-auto">
        <div className="min-w-[1200px] grid gap-4 md:grid-cols-5">
          {STATUSES.map(status => (
            <div key={status} className="rounded-[1.5rem] bg-white border border-slate-200 p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{statusConfig[status]?.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{groupedTickets[status]?.length ?? 0} issues</p>
                </div>
                <span className={statusConfig[status]?.className}>{statusConfig[status]?.label}</span>
              </div>
              <div className="space-y-3">
                {groupedTickets[status]?.length > 0 ? (
                  groupedTickets[status].map(ticket => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white min-w-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-slate-500">{ticket.ticketId}</span>
                        <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900 leading-snug">{ticket.issueDescription}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className={supportLevelConfig[ticket.supportLevel]?.className}>{supportLevelConfig[ticket.supportLevel]?.label}</span>
                        <span className="badge bg-slate-100 text-slate-700">{ticket.project?.projectCode ?? 'No project'}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate">{ticket.assignedTo?.name ?? <span className="italic text-slate-400">Unassigned</span>}</span>
                        <span className="whitespace-nowrap text-right">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No tickets in this column</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">Page {page + 1} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary py-1.5 px-3">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-3">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
