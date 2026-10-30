import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Search, Users, FileText, Activity } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MONTH_NAMES } from '../lib/format'
import type { Restaurant, Report } from '../types'

interface DashboardStats {
  totalRestaurants: number
  activeRestaurants: number
  totalReports: number
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalRestaurants: 0, activeRestaurants: 0, totalReports: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'reports'>('restaurants')

  useEffect(() => {
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
    fetchData()
  }, [])

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

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120' }}>
      {/* Header */}
      <header style={{
        background: '#0b1120',
        padding: '13px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              style={{
                background: '#1a2235',
                borderRadius: 16,
                padding: '20px 22px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  {s.label}
                </p>
                <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
                {loading ? '-' : s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1a2235', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {(['restaurants', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'restaurants' ? 'Restaurants' : 'Reports'}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab === 'restaurants' && (
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, city..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                fontSize: 14,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                outline: 'none',
                background: '#1a2235',
                color: '#f1f5f9',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Restaurants table */}
        {activeTab === 'restaurants' && (
          <div style={{ background: '#1a2235', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Name', 'City', 'Phone', 'Phone 2', 'Email', 'Status', 'Platforms'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No restaurants found</td></tr>
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
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: r.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: r.status === 'active' ? '#6ee7b7' : '#fca5a5',
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {Object.keys(r.platform_ids || {}).map(p => (
                              <span key={p} style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 5,
                                background: p === 'swiggy' ? 'rgba(249,115,22,0.15)' : 'rgba(226,55,68,0.15)',
                                color: p === 'swiggy' ? '#fb923c' : '#f87171',
                                textTransform: 'capitalize',
                              }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
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
                      <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>
                        {h}
                      </th>
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
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                          {getRestaurantName(r.restaurant_id)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 10px',
                            borderRadius: 5,
                            background: r.platform === 'swiggy' ? 'rgba(249,115,22,0.15)' : 'rgba(226,55,68,0.15)',
                            color: r.platform === 'swiggy' ? '#fb923c' : '#f87171',
                            textTransform: 'capitalize',
                          }}>
                            {r.platform}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                          {MONTH_NAMES[r.month]} {r.year}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{r.period_type}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: r.status === 'generated' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: r.status === 'generated' ? '#6ee7b7' : '#fbbf24',
                          }}>
                            {r.status}
                          </span>
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
    </div>
  )
}
