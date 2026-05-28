import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
}

export const usersApi = {
  getAll: () => api.get('/users').then(r => r.data),
  getById: (id) => api.get(`/users/${id}`).then(r => r.data),
  create: (data) => api.post('/users', data).then(r => r.data),
}

export const projectsApi = {
  getAll: () => api.get('/projects').then(r => r.data),
  getById: (id) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data) => api.post('/projects', data).then(r => r.data),
  assignUser: (projectId, userId) => api.put(`/projects/${projectId}/users/${userId}`).then(r => r.data),
}

export const ticketsApi = {
  getAll: (params) => api.get('/tickets', { params }).then(r => r.data),
  getById: (id) => api.get(`/tickets/${id}`).then(r => r.data),
  create: (data) => api.post('/tickets', data).then(r => r.data),
  update: (id, data) => api.put(`/tickets/${id}`, data).then(r => r.data),
  assign: (id, data) => api.patch(`/tickets/${id}/assign`, data).then(r => r.data),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data).then(r => r.data),
  addResolution: (id, data) => api.patch(`/tickets/${id}/resolution`, data).then(r => r.data),
}

export const slaApi = {
  getSLAStatus: (ticketId, slaType) => api.get(`/v1/sla/tracking/ticket/${ticketId}/sla/${slaType}`).then(r => r.data),
  getTicketSLAs: (ticketId) => api.get(`/v1/sla/tracking/ticket/${ticketId}`).then(r => r.data),
  startSLA: (data) => api.post(`/v1/sla/tracking/start`, data).then(r => r.data),
  stopSLA: (data) => api.post(`/v1/sla/tracking/stop`, data).then(r => r.data),
  pauseSLA: (data) => api.post(`/v1/sla/tracking/pause`, data).then(r => r.data),
  resumeSLA: (data) => api.post(`/v1/sla/tracking/resume`, data).then(r => r.data),

  // SLA Policy APIs
  getPoliciesByProjectId: (projectId) => api.get(`/v1/sla/policies/project/${projectId}`).then(r => r.data),
  createPolicy: (policyData) => api.post(`/v1/sla/policies`, policyData).then(r => r.data),
  updatePolicy: (policyId, updateData) => api.put(`/v1/sla/policies/${policyId}`, updateData).then(r => r.data),
  deletePolicy: (policyId) => api.delete(`/v1/sla/policies/${policyId}`).then(r => r.data),
  initializeDefaultPolicies: (projectId) => api.post(`/v1/sla/policies/project/${projectId}/initialize-defaults`).then(r => r.data),

  // Breaches
  getBreachesByTicketId: (ticketId) => api.get(`/v1/sla/breaches/ticket/${ticketId}`).then(r => r.data),
  getUnacknowledgedBreaches: () => api.get(`/v1/sla/breaches/unacknowledged`).then(r => r.data),
  acknowledgeBreach: (breachId, notes) => api.put(`/v1/sla/breaches/${breachId}/acknowledge`, { acknowledgment_notes: notes }).then(r => r.data),

  // Metrics
  getProjectMetrics: (projectId) => api.get(`/v1/sla/metrics/project/${projectId}`).then(r => r.data),
  getAggregateMetrics: () => api.get(`/v1/sla/metrics/aggregate`).then(r => r.data),
}

export default api