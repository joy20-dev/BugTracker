import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TicketsPage from './pages/TicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import CreateTicketPage from './pages/CreateTicketPage'
import ProjectsPage from './pages/ProjectsPage'
import UsersPage from './pages/UsersPage'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
      } />
      <Route path="/tickets" element={
        <PrivateRoute><Layout><TicketsPage /></Layout></PrivateRoute>
      } />
      <Route path="/tickets/new" element={
        <PrivateRoute><Layout><CreateTicketPage /></Layout></PrivateRoute>
      } />
      <Route path="/tickets/:id" element={
        <PrivateRoute><Layout><TicketDetailPage /></Layout></PrivateRoute>
      } />
      <Route path="/projects" element={
        <PrivateRoute><Layout><ProjectsPage /></Layout></PrivateRoute>
      } />
      <Route path="/users" element={
        <AdminRoute><Layout><UsersPage /></Layout></AdminRoute>
      } />
    </Routes>
  )
}