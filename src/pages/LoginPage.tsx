import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { loginRestaurant } from '../lib/auth'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginRestaurant(identifier)
      setUser(user)
      navigate('/reports')
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
      backgroundColor: '#f5f4f2',
      backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)',
      backgroundSize: '22px 22px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 32px',
          border: '1px solid #ede9e4',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 48, marginBottom: 20 }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
            Restaurant login
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Enter your registered phone number
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Phone number
            </label>
            <input
              type="tel"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="9876543210"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                outline: 'none',
                background: '#fafaf9',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#94a3b8'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 10, margin: 0, fontWeight: 600 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !identifier}
            style={{
              padding: '14px',
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
              background: loading ? '#94a3b8' : '#0b1120',
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

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 28, fontWeight: 500 }}>
          Powered by Foodnomix
        </p>
      </motion.div>
    </div>
  )
}
