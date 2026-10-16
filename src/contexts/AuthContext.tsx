import { createContext, useContext, useState, useCallback } from 'react'
import type { AuthUser, RestaurantUser } from '../lib/auth'
import { getUser, clearAuth } from '../lib/auth'

const DEV_USER: RestaurantUser = {
  type: 'restaurant',
  id: '42ebd150-2f95-47e7-83e9-141797ca7378',
  name: 'Happy Restaurant',
  email: 'happy@test.com',
  phone: '9999999993',
}

function isDev() {
  return import.meta.env.DEV || window.location.hostname === 'localhost'
}

interface AuthContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = getUser()
    if (saved) return saved
    if (isDev()) return DEV_USER
    return null
  })

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
