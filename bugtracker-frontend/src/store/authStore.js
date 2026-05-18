import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),

  login: (authResponse) => {
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user', JSON.stringify({
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    }))
    set({
      token: authResponse.token,
      user: {
        id: authResponse.userId,
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role
      }
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.role === 'ADMIN'
  },

  isManager: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return ['ADMIN', 'MANAGER'].includes(user?.role)
  },
}))

export default useAuthStore