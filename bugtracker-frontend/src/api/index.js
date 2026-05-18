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

export default api