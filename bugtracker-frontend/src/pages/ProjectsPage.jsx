import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api'
import { Plus, X, FolderKanban } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const qc = useQueryClient()
  const { isManager } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ projectCode: '', projectName: '', description: '' })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const mutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
      setShowForm(false)
      setForm({ projectCode: '', projectName: '', description: '' })
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create project'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects?.length ?? 0} projects</p>
        </div>
        {isManager() && (
          <button onClick={() => setShowForm(f => !f)} className="btn-primary">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create Project</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Code *</label>
              <input
                required maxLength={20}
                value={form.projectCode}
                onChange={e => setForm(f => ({ ...f, projectCode: e.target.value.toUpperCase() }))}
                placeholder="e.g. PAY"
                className="input font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
              <input
                required
                value={form.projectName}
                onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                placeholder="Payment Service"
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the project..."
                className="input resize-none"
              />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(projects ?? []).map(project => (
          <div key={project.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderKanban size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-blue-600">{project.projectCode}</p>
                <p className="font-semibold text-gray-900 text-sm">{project.projectName}</p>
              </div>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
            )}
            <p className="text-xs text-gray-400">Created {formatDate(project.createdAt)}</p>
          </div>
        ))}
      </div>

      {!isLoading && projects?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FolderKanban size={40} className="mx-auto mb-3 opacity-40" />
          <p>No projects yet. Create one to get started.</p>
        </div>
      )}
    </div>
  )
}