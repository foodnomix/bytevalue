const TOKEN_KEY = 'bv_token'
const USER_KEY = 'bv_user'

export interface RestaurantUser {
  type: 'restaurant'
  id: string
  name: string
  email: string | null
  phone: string | null
}

export interface AdminUser {
  type: 'admin'
  id: string
  name: string
  email: string
  role: 'developer' | 'super_admin' | 'view_only'
  tags: string[]
}

export type AuthUser = RestaurantUser | AdminUser

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setAuth(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch { /* storage blocked */ }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch { /* storage blocked */ }
}

export async function loginRestaurant(identifier: string, pin: string) {
  const res = await fetch('/api/auth/restaurant-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, pin }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')

  const user: RestaurantUser = {
    type: 'restaurant',
    id: data.restaurant.id,
    name: data.restaurant.name,
    email: data.restaurant.email,
    phone: data.restaurant.phone,
  }
  setAuth(data.token, user)
  return user
}

export async function loginAdmin(email: string, password: string) {
  const res = await fetch('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')

  const user: AdminUser = {
    type: 'admin',
    id: data.admin.id,
    name: data.admin.name,
    email: data.admin.email,
    role: data.admin.role,
    tags: data.admin.tags,
  }
  setAuth(data.token, user)
  return user
}

export function logout() {
  clearAuth()
  window.location.href = '/login'
}
