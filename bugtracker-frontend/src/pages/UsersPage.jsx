import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import { Plus, X } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const ROLES = ['ADMIN', 'MANAGER', 'SUPPORT_ENGINEER']

const roleBadge = {
  ADMIN: 'badge bg-red-100 text-red-700',
  MANAGER: 'badge bg-purple-100 text-purple-700',
  SUPPORT_ENGINEER: 'badge bg-blue-100 text-blue-700',
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SUPPORT_ENGINEER' })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created!')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'SUPPORT_ENGINEER' })
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create user'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Team directory</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-500">{users?.length ?? 0} users across your support and engineering teams.</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} className="btn-primary inline-flex items-center gap-2">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New User'}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create User</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Doe" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@company.com" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <input required type="password" minLength={6} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Name', 'Email', 'Role', 'Created'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>}
            {!isLoading && users?.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No users</td></tr>
            )}
            {(users ?? []).map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={roleBadge[u.role]}>{u.role.replace('_', ' ')}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}