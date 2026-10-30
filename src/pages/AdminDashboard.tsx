import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Search, Users, FileText, Activity, Eye, Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MONTH_NAMES } from '../lib/format'
import type { Restaurant, Report } from '../types'

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

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a2235', borderRadius: 20, padding: '28px 28px 24px',
          border: '1px solid rgba(255,255,255,0.08)',
          width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
            padding: 6, cursor: 'pointer', color: '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
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
  outline: 'none', background: '#0f1729', color: '#f1f5f9',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  display: 'block', marginBottom: 4,
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalRestaurants: 0, activeRestaurants: 0, totalReports: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'reports'>('restaurants')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const isDeveloper = user?.type === 'admin' && user.role === 'developer'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/data')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const rests = data.restaurants || []
      const reps = data.reports || []

      setRestaurants(rests)
      setReports(reps)
      setStats({
        totalRestaurants: rests.length,
        activeRestaurants: rests.filter((r: Restaurant) => r.status === 'active').length,
        totalReports: reps.length,
      })
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    }
    setLoading(false)
  }

  async function handleDelete(restaurant: Restaurant) {
    setActionLoading(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/restaurant?id=${restaurant.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ type: 'none' })
      await fetchData()
    } catch (err) {
      setActionError((err as Error).message)
    }
    setActionLoading(false)
  }

  async function handleEdit(id: string, updates: Partial<Restaurant>) {
    setActionLoading(true)
    setActionError('')
    try {
      const res = await fetch('/api/admin/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ type: 'none' })
      await fetchData()
    } catch (err) {
      setActionError((err as Error).message)
    }
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

  const statCards = [
    { label: 'Total Restaurants', value: stats.totalRestaurants, icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Active', value: stats.activeRestaurants, icon: <Activity size={20} />, color: '#10b981' },
    { label: 'Reports Uploaded', value: stats.totalReports, icon: <FileText size={20} />, color: '#f59e0b' },
  ]

  const tableHeaders = isDeveloper
    ? ['Name', 'City', 'Phone', 'Phone 2', 'Email', 'Status', 'Platforms', 'Actions']
    : ['Name', 'City', 'Phone', 'Phone 2', 'Email', 'Status', 'Platforms']

  const colSpan = tableHeaders.length

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
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 6 }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
              {user.type === 'admin' ? user.name : ''}
            </span>
          )}
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <LogOut size={14} /> Logout
          </button>
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
          {(['restaurants', 'reports'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.2s',
            }}>
              {tab === 'restaurants' ? 'Restaurants' : 'Reports'}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab === 'restaurants' && (
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, city..."
              style={{ width: '100%', padding: '10px 14px 10px 40px', fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, outline: 'none', background: '#1a2235', color: '#f1f5f9', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Restaurants table */}
        {activeTab === 'restaurants' && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {tableHeaders.map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={colSpan} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={colSpan} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No restaurants found</td></tr>
                  ) : (
                    filtered.map(r => (
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
                        {isDeveloper && (
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <ActionBtn icon={<Eye size={13} />} color="#3b82f6" onClick={() => setModal({ type: 'view', restaurant: r })} />
                              <ActionBtn icon={<Pencil size={13} />} color="#f59e0b" onClick={() => setModal({ type: 'edit', restaurant: r })} />
                              <ActionBtn icon={<Trash2 size={13} />} color="#ef4444" onClick={() => { setActionError(''); setModal({ type: 'confirm-delete', restaurant: r }) }} />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports table */}
        {activeTab === 'reports' && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Restaurant', 'Platform', 'Month', 'Period', 'Status', 'Uploaded'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No reports uploaded yet</td></tr>
                  ) : (
                    reports.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{getRestaurantName(r.restaurant_id)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 5,
                            background: r.platform === 'swiggy' ? 'rgba(249,115,22,0.15)' : 'rgba(226,55,68,0.15)',
                            color: r.platform === 'swiggy' ? '#fb923c' : '#f87171', textTransform: 'capitalize',
                          }}>{r.platform}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{MONTH_NAMES[r.month]} {r.year}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{r.period_type}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                            background: r.status === 'generated' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: r.status === 'generated' ? '#6ee7b7' : '#fbbf24',
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
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
            <DetailRow label="Onboarding Date" value={modal.restaurant.onboarding_date || 'Not set'} />
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {modal.type === 'edit' && (
        <EditModal
          restaurant={modal.restaurant}
          onClose={() => setModal({ type: 'none' })}
          onSave={(updates) => {
            setActionError('')
            setModal({ type: 'confirm-edit', restaurant: modal.restaurant, updates })
          }}
        />
      )}

      {/* Confirm Edit Modal */}
      {modal.type === 'confirm-edit' && (
        <Modal onClose={() => setModal({ type: 'edit', restaurant: modal.restaurant })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>Confirm changes</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
            Are you sure you want to update <strong style={{ color: '#f1f5f9' }}>{modal.restaurant.name}</strong>?
          </p>
          {actionError && <p style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'edit', restaurant: modal.restaurant })} />
            <ModalBtn label={actionLoading ? 'Saving...' : 'Yes, save changes'} color="#f59e0b" disabled={actionLoading}
              onClick={() => handleEdit(modal.restaurant.id, modal.updates)} />
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {modal.type === 'confirm-delete' && (
        <Modal onClose={() => setModal({ type: 'none' })}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5', margin: '0 0 8px' }}>Delete restaurant</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 6px', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{modal.restaurant.name}</strong>?
          </p>
          <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 20px' }}>This action cannot be undone. All reports associated with this restaurant will also be affected.</p>
          {actionError && <p style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ModalBtn label="Cancel" color="#475569" onClick={() => setModal({ type: 'none' })} />
            <ModalBtn label={actionLoading ? 'Deleting...' : 'Yes, delete'} color="#ef4444" disabled={actionLoading}
              onClick={() => handleDelete(modal.restaurant)} />
          </div>
        </Modal>
      )}
    </div>
  )
}

function ActionBtn({ icon, color, onClick }: { icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 7,
      padding: '5px 7px', cursor: 'pointer', color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
    }}>
      {icon}
    </button>
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
      background: disabled ? '#334155' : color, color: '#fff',
      transition: 'all 0.15s', opacity: disabled ? 0.6 : 1,
    }}>
      {label}
    </button>
  )
}

function EditModal({ restaurant, onClose, onSave }: { restaurant: Restaurant; onClose: () => void; onSave: (u: Partial<Restaurant>) => void }) {
  const [form, setForm] = useState({
    name: restaurant.name,
    email: restaurant.email,
    phone: restaurant.phone,
    phone2: restaurant.phone2 || '',
    city: restaurant.city || '',
    state: restaurant.state || '',
    status: restaurant.status,
  })

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px' }}>Edit restaurant</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Phone 2</label>
            <input style={inputStyle} value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
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
