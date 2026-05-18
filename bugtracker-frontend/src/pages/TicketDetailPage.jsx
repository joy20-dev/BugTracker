import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, usersApi } from '../api'
import { priorityConfig, statusConfig, supportLevelConfig, formatDate, formatResolutionTime, VALID_TRANSITIONS } from '../utils/helpers'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

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
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-blue-600 font-bold text-lg">{ticket.ticketId}</span>
            <span className={statusConfig[ticket.currentStatus]?.className}>{statusConfig[ticket.currentStatus]?.label}</span>
            <span className={priorityConfig[ticket.priority]?.className}>{priorityConfig[ticket.priority]?.label}</span>
            <span className={supportLevelConfig[ticket.supportLevel]?.className}>{ticket.supportLevel}</span>
          </div>
          <p className="text-gray-500 text-sm">
            {ticket.project?.projectName} ({ticket.project?.projectCode}) &bull; Created {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
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
        </div>
      </div>
    </div>
  )
}