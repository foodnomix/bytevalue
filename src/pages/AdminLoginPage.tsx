import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { loginAdmin, clearAuth } from '../lib/auth'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.type === 'admin') {
      navigate('/admin', { replace: true })
    } else if (user) {
      clearAuth()
      setUser(null)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginAdmin(email, password)
      setUser(user)
      navigate('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#0b1120',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#1a2235',
          borderRadius: 20,
          padding: '40px 32px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 48, marginBottom: 20 }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px' }}>
            Admin panel
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Sign in with your admin credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@foodnomix.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
                background: '#0f1729',
                color: '#f1f5f9',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
                background: '#0f1729',
                color: '#f1f5f9',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 10, margin: 0, fontWeight: 600 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              padding: '14px',
              fontSize: 15,
              fontWeight: 800,
              color: '#0b1120',
              background: loading ? '#475569' : '#f1f5f9',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
