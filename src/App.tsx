import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ReportPage from './pages/ReportPage'
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Restaurant: authenticated report view */}
          <Route path="/reports" element={
            <RestaurantGuard><ReportPage /></RestaurantGuard>
          } />

          {/* Admin panel placeholder */}
          <Route path="/admin" element={
            <AdminGuard><div>Admin dashboard (coming soon)</div></AdminGuard>
          } />

          {/* Legacy: /:code still works for backward compat during transition */}
          <Route path="/:code" element={<ReportPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
