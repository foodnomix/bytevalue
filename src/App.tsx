import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ReportPage from './pages/ReportPage'
import AdminDashboard from './pages/AdminDashboard'
import './index.css'

function RestaurantGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || user.type !== 'restaurant') return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || user.type !== 'admin') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function SmartRedirect() {
  const { user } = useAuth()
  if (user?.type === 'restaurant') return <Navigate to="/reports" replace />
  if (user?.type === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/reports" element={
            <RestaurantGuard><ReportPage /></RestaurantGuard>
          } />

          <Route path="/admin" element={
            <AdminGuard><AdminDashboard /></AdminGuard>
          } />

          <Route path="/" element={<SmartRedirect />} />
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
