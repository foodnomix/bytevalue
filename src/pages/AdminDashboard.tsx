import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Search, Users, FileText, Activity, Eye, Pencil, Trash2, X, UserPlus, Shield, Clock, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MONTH_NAMES } from '../lib/format'
import type { Restaurant, Report } from '../types'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  created_at: string
  last_login_at: string | null
}

interface ActivityLogEntry {
  id: string
  admin_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: string | null
  ip_address: string | null
  created_at: string
}

interface DashboardStats {
  totalRestaurants: number
  activeRestaurants: number
  totalReports: number
}

type ModalState =
  | { type: 'none' }
  | { type: 'view'; restaurant: Restaurant }
  | { type: 'edit'; restaurant: Restaurant }
  | { type: 'confirm-delete'; restaurant: Restaurant }
  | { type: 'confirm-edit'; restaurant: Restaurant; updates: Partial<Restaurant> }
  | { type: 'view-user'; user: AdminUser }
  | { type: 'edit-user'; user: AdminUser }
  | { type: 'confirm-edit-user'; user: AdminUser; updates: Record<string, string> }
  | { type: 'confirm-delete-user'; user: AdminUser }
  | { type: 'add-user' }
  | { type: 'add-restaurant' }

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a2235', borderRadius: 20, padding: '28px 28px 24px',
          border: '1px solid rgba(255,255,255,0.08)',
          width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
          padding: 6, cursor: 'pointer', color: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={16} />
        </button>
        {children}
      </motion.div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  outline: 'none', background: '#0f1729', color: '#f1f5f9', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4,
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalRestaurants: 0, activeRestaurants: 0, totalReports: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'reports' | 'users' | 'activity'>('restaurants')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const role = user?.type === 'admin' ? user.role : 'view_only'
  const isDeveloper = role === 'developer'
  const canEdit = role === 'developer' || role === 'super_admin'
  const canDelete = role === 'developer'

  const adminInfo = user?.type === 'admin' ? { admin_id: user.id, admin_name: user.name, admin_email: user.email } : {}

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const fetches: Promise<Response>[] = [
        fetch('/api/admin/data'),
        fetch('/api/admin/users'),
      ]
      if (isDeveloper) fetches.push(fetch('/api/admin/activity-log?limit=200'))

      const responses = await Promise.all(fetches)
      const data = await responses[0].json()
      const usersData = await responses[1].json()

      const rests = data.restaurants || []
      const reps = data.reports || []
      setRestaurants(rests)
      setReports(reps)
      setAdminUsers(usersData.users || [])
      setStats({
        totalRestaurants: rests.length,
        activeRestaurants: rests.filter((r: Restaurant) => r.status === 'active').length,
        totalReports: reps.length,
      })

      if (isDeveloper && responses[2]) {
        const logData = await responses[2].json()
        setActivityLogs(logData.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    }
    setLoading(false)
  }

  async function handleDeleteRestaurant(restaurant: Restaurant) {
    setActionLoading(true); setActionError('')
    try {
      const params = new URLSearchParams({ id: restaurant.id, ...adminInfo } as Record<string, string>)
      const res = await fetch(`/api/admin/restaurant?${params}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.details ? `${data.error}: ${data.details}` : data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  async function handleEditRestaurant(id: string, updates: Partial<Restaurant>) {
    setActionLoading(true); setActionError('')
    try {
      const res = await fetch('/api/admin/restaurant', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, ...adminInfo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.details ? `${data.error}: ${data.details}` : data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  async function handleAddUser(form: Record<string, string>) {
    setActionLoading(true); setActionError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...adminInfo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  async function handleEditUser(id: string, updates: Record<string, string>) {
    setActionLoading(true); setActionError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, ...adminInfo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  async function handleDeleteUser(u: AdminUser) {
    setActionLoading(true); setActionError('')
    try {
      const params = new URLSearchParams({ id: u.id, ...adminInfo } as Record<string, string>)
      const res = await fetch(`/api/admin/users?${params}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  async function handleAddRestaurant(form: Record<string, string>) {
    setActionLoading(true); setActionError('')
    try {
      const res = await fetch('/api/admin/restaurant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...adminInfo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.details ? `${data.error}: ${data.details}` : data.error)
      setModal({ type: 'none' }); await fetchData()
    } catch (err) { setActionError((err as Error).message) }
    setActionLoading(false)
  }

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.includes(search) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  )

  function getRestaurantName(id: string) {
    return restaurants.find(r => r.id === id)?.name || 'Unknown'
  }

  interface GroupedReport {
    key: string
    restaurant_id: string
    month: number
    year: number
    report_no: number
    platforms: { platform: string; status: string; created_at?: string }[]
  }

  const groupedReports: GroupedReport[] = (() => {
    const map = new Map<string, GroupedReport>()
    for (const r of reports) {
      const key = `${r.restaurant_id}-${r.report_no}`
      if (!map.has(key)) {
        map.set(key, {
          key, restaurant_id: r.restaurant_id,
          month: r.month, year: r.year, report_no: r.report_no,
          platforms: [],
        })
      }
      map.get(key)!.platforms.push({ platform: r.platform, status: r.status, created_at: r.created_at })
    }
    return Array.from(map.values())
  })()

  const statCards = [
    { label: 'Total Restaurants', value: stats.totalRestaurants, icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Active', value: stats.activeRestaurants, icon: <Activity size={20} />, color: '#10b981' },
    { label: 'Reports Uploaded', value: stats.totalReports, icon: <FileText size={20} />, color: '#f59e0b' },
  ]

  const hasActions = canEdit || canDelete
  const restHeaders = ['Name', 'City', 'Phone', 'Phone 2', 'Email', 'Status', 'Platforms']
  if (hasActions) restHeaders.push('Actions')

  const tabs = isDeveloper
    ? (['restaurants', 'reports', 'users', 'activity'] as const)
    : (['restaurants', 'reports', 'users'] as const)

  const roleBadge = (r: string) => {
    const colors: Record<string, { bg: string; fg: string }> = {
      developer: { bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
      super_admin: { bg: 'rgba(59,130,246,0.15)', fg: '#93c5fd' },
      view_only: { bg: 'rgba(100,116,139,0.15)', fg: '#94a3b8' },
    }
    const c = colors[r] || colors.view_only
    return (
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: c.bg, color: c.fg }}>
        {r === 'super_admin' ? 'Admin' : r === 'view_only' ? 'View Only' : 'Developer'}
      </span>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120' }}>
      {/* Header */}
      <header style={{
        background: '#0b1120', padding: '13px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 36 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 6 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{user.type === 'admin' ? user.name : ''}</span>}
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}><LogOut size={14} /> Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }}
              style={{ background: '#1a2235', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{s.label}</p>
                <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>{loading ? '-' : s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1a2235', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.2s',
            }}>
              {tab === 'restaurants' ? 'Restaurants' : tab === 'reports' ? 'Reports' : tab === 'users' ? 'Users' : 'Activity'}
            </button>
          ))}
        </div>

        {/* Search (restaurants) */}
        {activeTab === 'restaurants' && (
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, city..."
              style={{ width: '100%', padding: '10px 14px 10px 40px', fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, outline: 'none', background: '#1a2235', color: '#f1f5f9', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* ===== RESTAURANTS TABLE ===== */}
        {activeTab === 'restaurants' && isDeveloper && (
          <button onClick={() => { setActionError(''); setModal({ type: 'add-restaurant' }) }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            fontSize: 13, fontWeight: 700, color: '#fff', background: '#3b82f6',
            border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 16,
          }}>
            <Plus size={15} /> Add restaurant
          </button>
        )}
        {activeTab === 'restaurants' && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {restHeaders.map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={restHeaders.length} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={restHeaders.length} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No restaurants found</td></tr>
                  ) : filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{r.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{r.city || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{r.phone}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{r.phone2 || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{r.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                          background: r.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: r.status === 'active' ? '#6ee7b7' : '#fca5a5',
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {Object.keys(r.platform_ids || {}).map(p => (
                            <span key={p} style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                              background: p === 'swiggy' ? 'rgba(249,115,22,0.15)' : 'rgba(226,55,68,0.15)',
                              color: p === 'swiggy' ? '#fb923c' : '#f87171', textTransform: 'capitalize',
                            }}>{p}</span>
                          ))}
                        </div>
                      </td>
                      {hasActions && (
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <ActionBtn icon={<Eye size={13} />} color="#3b82f6" onClick={() => setModal({ type: 'view', restaurant: r })} />
                            {canEdit && <ActionBtn icon={<Pencil size={13} />} color="#f59e0b" onClick={() => setModal({ type: 'edit', restaurant: r })} />}
                            {canDelete && <ActionBtn icon={<Trash2 size={13} />} color="#ef4444" onClick={() => { setActionError(''); setModal({ type: 'confirm-delete', restaurant: r }) }} />}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== REPORTS TABLE (grouped) ===== */}
        {activeTab === 'reports' && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Restaurant', 'Platforms', 'Month', 'Report', 'Status', 'Uploaded'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : groupedReports.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No reports uploaded yet</td></tr>
                  ) : groupedReports.map(g => {
                    const allGenerated = g.platforms.every(p => p.status === 'generated')
                    const latestDate = g.platforms.reduce((latest, p) => {
                      if (!p.created_at) return latest
                      return !latest || new Date(p.created_at) > new Date(latest) ? p.created_at : latest
                    }, '' as string)

                    return (
                      <tr key={g.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{getRestaurantName(g.restaurant_id)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {g.platforms.map(p => (
                              <span key={p.platform} style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                                background: p.platform === 'swiggy' ? 'rgba(249,115,22,0.15)' : 'rgba(226,55,68,0.15)',
                                color: p.platform === 'swiggy' ? '#fb923c' : '#f87171', textTransform: 'capitalize',
                              }}>{p.platform}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{MONTH_NAMES[g.month]} {g.year}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Report {String(g.report_no).padStart(2, '0')}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                            background: allGenerated ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: allGenerated ? '#6ee7b7' : '#fbbf24',
                          }}>{allGenerated ? 'generated' : 'pending'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                          {latestDate ? new Date(latestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== USERS TABLE ===== */}
        {activeTab === 'users' && (
          <>
            {isDeveloper && (
              <button onClick={() => { setActionError(''); setModal({ type: 'add-user' }) }} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                fontSize: 13, fontWeight: 700, color: '#fff', background: '#3b82f6',
                border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 16,
              }}>
                <UserPlus size={15} /> Add user
              </button>
            )}
            <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Name', 'Email', 'Role', 'Status', 'Last Login', ...(isDeveloper ? ['Actions'] : [])].map(h => (
                        <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={isDeveloper ? 6 : 5} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                    ) : adminUsers.length === 0 ? (
                      <tr><td colSpan={isDeveloper ? 6 : 5} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No users found</td></tr>
                    ) : adminUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{u.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>{roleBadge(u.role)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                            background: u.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: u.status === 'active' ? '#6ee7b7' : '#fca5a5',
                          }}>{u.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                          {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                        </td>
                        {isDeveloper && (
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <ActionBtn icon={<Eye size={13} />} color="#3b82f6" onClick={() => setModal({ type: 'view-user', user: u })} />
                              <ActionBtn icon={<Pencil size={13} />} color="#f59e0b" onClick={() => setModal({ type: 'edit-user', user: u })} />
                              <ActionBtn icon={<Trash2 size={13} />} color="#ef4444" onClick={() => { setActionError(''); setModal({ type: 'confirm-delete-user', user: u }) }} />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* ===== ACTIVITY LOG ===== */}
        {activeTab === 'activity' && isDeveloper && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={16} color="#3b82f6" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Activity Log</span>
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>{activityLogs.length} entries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Time', 'User', 'Action', 'Target', 'Details'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : activityLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No activity recorded yet</td></tr>
                  ) : activityLogs.map(log => {
                    const d = parseLogDetails(log.details)
                    const targetName = String(d.restaurant_name || d.user_name || d.admin_name || '')
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                          {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{String(d.admin_name || 'Unknown')}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{String(d.admin_email || '')}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <ActionBadge action={log.action} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{targetName}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{log.entity_type || ''}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatLogDetails(log.action, d)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {modal.type === 'view' && (
        <Modal onClose={() => setModal({ type: 'none' })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>{modal.restaurant.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DetailRow label="Phone" value={modal.restaurant.phone} />
            <DetailRow label="Phone 2" value={modal.restaurant.phone2 || 'Not set'} />
            <DetailRow label="Email" value={modal.restaurant.email} />
            <DetailRow label="City" value={modal.restaurant.city || 'Not set'} />
            <DetailRow label="State" value={modal.restaurant.state || 'Not set'} />
            <DetailRow label="Status" value={modal.restaurant.status} />
            <DetailRow label="Platforms" value={Object.keys(modal.restaurant.platform_ids || {}).join(', ') || 'None'} />
          </div>
        </Modal>
      )}

      {modal.type === 'edit' && (
        <EditRestaurantModal restaurant={modal.restaurant}
          onClose={() => setModal({ type: 'none' })}
          onSave={updates => { setActionError(''); setModal({ type: 'confirm-edit', restaurant: modal.restaurant, updates }) }}
        />
      )}

      {modal.type === 'confirm-edit' && (
        <Modal onClose={() => setModal({ type: 'edit', restaurant: modal.restaurant })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>Confirm changes</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px' }}>Are you sure you want to update <strong style={{ color: '#f1f5f9' }}>{modal.restaurant.name}</strong>?</p>
          {actionError && <ErrorMsg msg={actionError} />}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'edit', restaurant: modal.restaurant })} />
            <ModalBtn label={actionLoading ? 'Saving...' : 'Yes, save changes'} color="#f59e0b" disabled={actionLoading}
              onClick={() => handleEditRestaurant(modal.restaurant.id, modal.updates)} />
          </div>
        </Modal>
      )}

      {modal.type === 'confirm-delete' && (
        <Modal onClose={() => setModal({ type: 'none' })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5', margin: '0 0 8px' }}>Delete restaurant</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 6px' }}>Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{modal.restaurant.name}</strong>?</p>
          <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 20px' }}>This action cannot be undone.</p>
          {actionError && <ErrorMsg msg={actionError} />}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'none' })} />
            <ModalBtn label={actionLoading ? 'Deleting...' : 'Yes, delete'} color="#ef4444" disabled={actionLoading}
              onClick={() => handleDeleteRestaurant(modal.restaurant)} />
          </div>
        </Modal>
      )}

      {modal.type === 'view-user' && (
        <Modal onClose={() => setModal({ type: 'none' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={20} color="#3b82f6" />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{modal.user.name}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DetailRow label="Email" value={modal.user.email} />
            <DetailRow label="Role" value={modal.user.role === 'super_admin' ? 'Admin' : modal.user.role === 'view_only' ? 'View Only' : 'Developer'} />
            <DetailRow label="Status" value={modal.user.status} />
            <DetailRow label="Created" value={modal.user.created_at ? new Date(modal.user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} />
            <DetailRow label="Last Login" value={modal.user.last_login_at ? new Date(modal.user.last_login_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'} />
          </div>
        </Modal>
      )}

      {modal.type === 'edit-user' && (
        <EditUserModal user={modal.user}
          onClose={() => setModal({ type: 'none' })}
          onSave={updates => { setActionError(''); setModal({ type: 'confirm-edit-user', user: modal.user, updates }) }}
        />
      )}

      {modal.type === 'confirm-edit-user' && (
        <Modal onClose={() => setModal({ type: 'edit-user', user: modal.user })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>Confirm changes</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px' }}>Are you sure you want to update <strong style={{ color: '#f1f5f9' }}>{modal.user.name}</strong>?</p>
          {actionError && <ErrorMsg msg={actionError} />}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'edit-user', user: modal.user })} />
            <ModalBtn label={actionLoading ? 'Saving...' : 'Yes, save changes'} color="#f59e0b" disabled={actionLoading}
              onClick={() => handleEditUser(modal.user.id, modal.updates)} />
          </div>
        </Modal>
      )}

      {modal.type === 'confirm-delete-user' && (
        <Modal onClose={() => setModal({ type: 'none' })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5', margin: '0 0 8px' }}>Delete user</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 6px' }}>Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{modal.user.name}</strong>?</p>
          <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 20px' }}>This action cannot be undone.</p>
          {actionError && <ErrorMsg msg={actionError} />}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'none' })} />
            <ModalBtn label={actionLoading ? 'Deleting...' : 'Yes, delete'} color="#ef4444" disabled={actionLoading}
              onClick={() => handleDeleteUser(modal.user)} />
          </div>
        </Modal>
      )}

      {modal.type === 'add-user' && (
        <AddUserModal
          onClose={() => setModal({ type: 'none' })}
          onSave={handleAddUser}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {modal.type === 'add-restaurant' && (
        <AddRestaurantModal
          onClose={() => setModal({ type: 'none' })}
          onSave={handleAddRestaurant}
          loading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  )
}

const ACTION_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
  login: { label: 'Logged in', bg: 'rgba(59,130,246,0.15)', fg: '#93c5fd' },
  update_restaurant: { label: 'Updated restaurant', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  delete_restaurant: { label: 'Deleted restaurant', bg: 'rgba(239,68,68,0.15)', fg: '#fca5a5' },
  create_user: { label: 'Created user', bg: 'rgba(16,185,129,0.15)', fg: '#6ee7b7' },
  update_user: { label: 'Updated user', bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  delete_user: { label: 'Deleted user', bg: 'rgba(239,68,68,0.15)', fg: '#fca5a5' },
  generate_report: { label: 'Generated report', bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
  create_restaurant: { label: 'Added restaurant', bg: 'rgba(16,185,129,0.15)', fg: '#6ee7b7' },
}

function ActionBadge({ action }: { action: string }) {
  const info = ACTION_LABELS[action] || { label: action, bg: 'rgba(100,116,139,0.15)', fg: '#94a3b8' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: info.bg, color: info.fg, whiteSpace: 'nowrap' }}>
      {info.label}
    </span>
  )
}

function parseLogDetails(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

function formatLogDetails(action: string, d: Record<string, unknown>): string {
  if (action === 'login') return `Role: ${d.role || 'unknown'}`
  if (action === 'update_restaurant' || action === 'update_user') {
    const fields = d.fields_updated
    if (Array.isArray(fields)) return `Changed: ${fields.join(', ')}`
    return 'Fields updated'
  }
  if (action === 'create_user') return `Role: ${d.role || 'unknown'}`
  if (action === 'delete_user') return d.user_email ? String(d.user_email) : ''
  if (action === 'create_restaurant') return d.city ? `${d.city}, ${d.state || ''}` : ''
  return ''
}

function ActionBtn({ icon, color, onClick }: { icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 7,
      padding: '5px 7px', cursor: 'pointer', color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>{icon}</button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function ModalBtn({ label, color, onClick, disabled }: { label: string; color: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '9px 18px', fontSize: 13, fontWeight: 700, borderRadius: 10,
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#334155' : color, color: '#fff', opacity: disabled ? 0.6 : 1,
    }}>{label}</button>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>{msg}</p>
}

function EditRestaurantModal({ restaurant, onClose, onSave }: { restaurant: Restaurant; onClose: () => void; onSave: (u: Partial<Restaurant>) => void }) {
  const pids = (restaurant.platform_ids || {}) as Record<string, string>
  const [form, setForm] = useState({
    name: restaurant.name, email: restaurant.email, phone: restaurant.phone,
    phone2: restaurant.phone2 || '', city: restaurant.city || '',
    state: restaurant.state || '', status: restaurant.status,
    swiggy_id: pids.swiggy || '', zomato_id: pids.zomato || '',
    pin: '', pin2: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>Edit restaurant</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div><label style={labelStyle}>Phone 2</label><input style={inputStyle} value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="Optional" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>PIN for Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep)</span></label><input type="password" inputMode="numeric" style={inputStyle} value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" maxLength={6} /></div>
          <div><label style={labelStyle}>PIN for Phone 2 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep)</span></label><input type="password" inputMode="numeric" style={inputStyle} value={form.pin2} onChange={e => set('pin2', e.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" maxLength={6} /></div>
        </div>
        <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>City</label><input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div><label style={labelStyle}>State</label><input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Swiggy ID</label><input style={inputStyle} value={form.swiggy_id} onChange={e => set('swiggy_id', e.target.value)} placeholder="e.g. 657649" /></div>
          <div><label style={labelStyle}>Zomato ID</label><input style={inputStyle} value={form.zomato_id} onChange={e => set('zomato_id', e.target.value)} placeholder="e.g. 19119894" /></div>
        </div>
        <div><label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option><option value="paused">Paused</option><option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <ModalBtn label="Cancel" color="#475569" onClick={onClose} />
        <ModalBtn label="Save changes" color="#f59e0b" onClick={() => onSave(form)} />
      </div>
    </Modal>
  )
}

function EditUserModal({ user, onClose, onSave }: { user: AdminUser; onClose: () => void; onSave: (u: Record<string, string>) => void }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, status: user.status, password: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>Edit user</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Role</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="developer">Developer</option><option value="super_admin">Admin</option><option value="view_only">View Only</option>
            </select>
          </div>
          <div><label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>New password <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep current)</span></label>
          <input type="password" style={inputStyle} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Enter new password" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <ModalBtn label="Cancel" color="#475569" onClick={onClose} />
        <ModalBtn label="Save changes" color="#f59e0b" onClick={() => {
          const updates: Record<string, string> = { name: form.name, email: form.email, role: form.role, status: form.status }
          if (form.password) updates.password = form.password
          onSave(updates)
        }} />
      </div>
    </Modal>
  )
}

function AddRestaurantModal({ onClose, onSave, loading, error }: { onClose: () => void; onSave: (f: Record<string, string>) => void; loading: boolean; error: string }) {
  const [form, setForm] = useState({ name: '', phone: '', phone2: '', email: '', city: '', state: '', swiggy_id: '', zomato_id: '', pin: '', pin2: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>Add new restaurant</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={labelStyle}>Restaurant name</label><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Hyderabad House" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Phone</label><input type="tel" style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" maxLength={10} /></div>
          <div><label style={labelStyle}>Phone 2 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input type="tel" style={inputStyle} value={form.phone2} onChange={e => set('phone2', e.target.value.replace(/\D/g, ''))} placeholder="Optional" maxLength={10} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>PIN for Phone</label><input type="password" inputMode="numeric" style={inputStyle} value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" maxLength={6} /></div>
          <div><label style={labelStyle}>PIN for Phone 2 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input type="password" inputMode="numeric" style={inputStyle} value={form.pin2} onChange={e => set('pin2', e.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" maxLength={6} /></div>
        </div>
        <div><label style={labelStyle}>Email <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>City</label><input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Omaha" /></div>
          <div><label style={labelStyle}>State</label><input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. NE" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Swiggy ID <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input style={inputStyle} value={form.swiggy_id} onChange={e => set('swiggy_id', e.target.value)} placeholder="e.g. 657649" /></div>
          <div><label style={labelStyle}>Zomato ID <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input style={inputStyle} value={form.zomato_id} onChange={e => set('zomato_id', e.target.value)} placeholder="e.g. 19119894" /></div>
        </div>
      </div>
      {error && <ErrorMsg msg={error} />}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <ModalBtn label="Cancel" color="#475569" onClick={onClose} />
        <ModalBtn label={loading ? 'Creating...' : 'Add restaurant'} color="#3b82f6" disabled={loading || !form.name || !form.phone}
          onClick={() => onSave(form)} />
      </div>
    </Modal>
  )
}

function AddUserModal({ onClose, onSave, loading, error }: { onClose: () => void; onSave: (f: Record<string, string>) => void; loading: boolean; error: string }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'view_only' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>Add new user</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></div>
        <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
        <div><label style={labelStyle}>Password</label><input type="password" style={inputStyle} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set a password" /></div>
        <div><label style={labelStyle}>Role</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="view_only">View Only</option><option value="super_admin">Admin</option><option value="developer">Developer</option>
          </select>
        </div>
      </div>
      {error && <ErrorMsg msg={error} />}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <ModalBtn label="Cancel" color="#475569" onClick={onClose} />
        <ModalBtn label={loading ? 'Creating...' : 'Create user'} color="#3b82f6" disabled={loading || !form.name || !form.email || !form.password}
          onClick={() => onSave(form)} />
      </div>
    </Modal>
  )
}
