import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, usersApi } from '../api'
import { priorityConfig, statusConfig, supportLevelConfig, formatDate, formatResolutionTime, VALID_TRANSITIONS } from '../utils/helpers'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import SLACountdownTimer from '../components/sla/SLACountdownTimer'
import SLADetailsPanel from '../components/sla/SLADetailsPanel'
import SLABreachBadge from '../components/sla/SLABreachBadge'

export default function TicketDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { isManager } = useAuthStore()

  const [assigneeId, setAssigneeId] = useState('')
  const [resolution, setResolution] = useState('')

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: isManager(),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['ticket', id] })

  const assignMutation = useMutation({
    mutationFn: (assigneeId) => ticketsApi.assign(id, { assigneeId: Number(assigneeId) }),
    onSuccess: () => { toast.success('Ticket assigned'); invalidate() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to assign'),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => ticketsApi.updateStatus(id, { status }),
    onSuccess: () => { toast.success('Status updated'); invalidate() },
    onError: (e) => toast.error(e.response?.data?.message || 'Invalid transition'),
  })

  const resolutionMutation = useMutation({
    mutationFn: () => ticketsApi.addResolution(id, { resolutionDetails: resolution }),
    onSuccess: () => { toast.success('Resolution saved'); setResolution(''); invalidate() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save'),
  })

  if (isLoading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>
  if (!ticket) return <div className="p-8 text-gray-400 text-sm">Ticket not found</div>

  const nextStatuses = VALID_TRANSITIONS[ticket.currentStatus] ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} /> Back to tickets
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className={statusConfig[ticket.currentStatus]?.className}>{statusConfig[ticket.currentStatus]?.label}</span>
          <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
          <span className={supportLevelConfig[ticket.supportLevel]?.className}>{supportLevelConfig[ticket.supportLevel]?.label}</span>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Issue detail</p>
            <h1 className="text-3xl font-semibold text-slate-900">{ticket.ticketId}: {ticket.issueDescription}</h1>
            <p className="mt-3 text-sm text-slate-500">{ticket.project?.projectName} ({ticket.project?.projectCode}) • Created {formatDate(ticket.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700">Created by {ticket.createdBy?.name}</span>
            <span className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700">Assigned to {ticket.assignedTo?.name ?? 'Unassigned'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Issue Description</h3>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.issueDescription}</p>
          </div>

          {ticket.remarks && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Remarks</h3>
              <p className="text-gray-700 text-sm">{ticket.remarks}</p>
            </div>
          )}

          {ticket.resolutionDetails && (
            <div className="card p-5 border-green-200 bg-green-50">
              <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CheckCircle size={14} /> Resolution
              </h3>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.resolutionDetails}</p>
            </div>
          )}

          {ticket.currentStatus !== 'CLOSED' && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add / Update Resolution</h3>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                rows={4}
                placeholder="Describe how this issue was resolved..."
                className="input resize-none mb-3"
              />
              <button
                onClick={() => resolutionMutation.mutate()}
                disabled={!resolution.trim() || resolutionMutation.isPending}
                className="btn-primary"
              >
                <CheckCircle size={15} />
                {resolutionMutation.isPending ? 'Saving...' : 'Save Resolution'}
              </button>
            </div>
          )}

          <SLADetailsPanel ticketId={id} />
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Assigned To</p>
              <p className="font-medium text-gray-800">{ticket.assignedTo?.name ?? <span className="text-gray-400 italic">Unassigned</span>}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Created By</p>
              <p className="font-medium text-gray-800">{ticket.createdBy?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Generation Date</p>
              <p className="text-gray-700">{formatDate(ticket.generationDate)}</p>
            </div>
            {ticket.responseDateTime && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">First Response</p>
                <p className="text-gray-700">{formatDate(ticket.responseDateTime)}</p>
              </div>
            )}
            {ticket.resolutionTime != null && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Resolution Time</p>
                <p className="font-medium text-gray-800">{formatResolutionTime(ticket.resolutionTime)}</p>
              </div>
            )}
          </div>

          {nextStatuses.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Move Status</h3>
              <div className="flex flex-col gap-2">
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending}
                    className="btn-secondary justify-start text-xs py-1.5"
                  >
                    → {statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isManager() && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assign To</h3>
              <select
                className="input text-sm mb-2"
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
              >
                <option value="">Select engineer...</option>
                {(users ?? []).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
                ))}
              </select>
              <button
                onClick={() => assignMutation.mutate(assigneeId)}
                disabled={!assigneeId || assignMutation.isPending}
                className="btn-primary w-full justify-center text-xs py-1.5"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SLA Agreements</h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Response SLA</p>
                  <div className="text-sm text-gray-700">
                    <SLACountdownTimer ticketId={id} slaType="RESPONSE" />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Resolution SLA</p>
                  <div className="text-sm text-gray-700">
                    <SLACountdownTimer ticketId={id} slaType="RESOLUTION" />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Breaches</p>
                  <div className="text-sm text-gray-700">
                    <SLABreachBadge ticketId={id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}