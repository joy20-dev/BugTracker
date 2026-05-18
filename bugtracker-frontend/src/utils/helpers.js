import { format, formatDistanceToNow } from 'date-fns'

export const priorityConfig = {
  LOW: { label: 'Low', className: 'badge bg-gray-100 text-gray-700' },
  MEDIUM: { label: 'Medium', className: 'badge bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', className: 'badge bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'Critical', className: 'badge bg-red-100 text-red-700' },
}

export const statusConfig = {
  OPEN: { label: 'Open', className: 'badge bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge bg-blue-100 text-blue-700' },
  WAITING_FOR_CUSTOMER: { label: 'Waiting', className: 'badge bg-yellow-100 text-yellow-700' },
  RESOLVED: { label: 'Resolved', className: 'badge bg-green-100 text-green-700' },
  CLOSED: { label: 'Closed', className: 'badge bg-gray-100 text-gray-500' },
}

export const supportLevelConfig = {
  L1: { label: 'L1', className: 'badge bg-indigo-100 text-indigo-700' },
  L2: { label: 'L2', className: 'badge bg-purple-100 text-purple-700' },
  L3: { label: 'L3', className: 'badge bg-pink-100 text-pink-700' },
}

export const formatDate = (date) =>
  date ? format(new Date(date), 'dd MMM yyyy, HH:mm') : '—'

export const formatRelative = (date) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '—'

export const formatResolutionTime = (minutes) => {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const VALID_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_CUSTOMER', 'RESOLVED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
}