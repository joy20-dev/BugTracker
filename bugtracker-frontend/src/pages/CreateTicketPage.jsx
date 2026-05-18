import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, projectsApi } from '../api'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    projectId: '',
    issueDescription: '',
    supportLevel: 'L1',
    priority: 'MEDIUM',
    remarks: '',
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  })

  const mutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      toast.success(`Ticket ${data.ticketId} created!`)
      navigate(`/tickets/${data.id}`)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create ticket'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.projectId) return toast.error('Please select a project')
    mutation.mutate({ ...form, projectId: Number(form.projectId) })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      <div className="card p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-6">Create New Ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project *</label>
            <select className="input" value={form.projectId} onChange={e => set('projectId', e.target.value)} required>
              <option value="">Select a project...</option>
              {(projects ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.projectCode} — {p.projectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Description *</label>
            <textarea
              required
              rows={5}
              value={form.issueDescription}
              onChange={e => set('issueDescription', e.target.value)}
              placeholder="Describe the bug or issue in detail..."
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority *</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Level *</label>
              <select className="input" value={form.supportLevel} onChange={e => set('supportLevel', e.target.value)}>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={e => set('remarks', e.target.value)}
              placeholder="Any additional notes..."
              className="input resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Creating...' : 'Create Ticket'}
            </button>
            <Link to="/tickets" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}