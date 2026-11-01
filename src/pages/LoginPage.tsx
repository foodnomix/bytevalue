import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginRestaurant, clearAuth } from '../lib/auth'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.type === 'restaurant') {
      navigate('/reports', { replace: true })
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
      const user = await loginRestaurant(phone, pin)
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
      background: 'linear-gradient(145deg, #0b1120 0%, #1a1025 40%, #2d1420 70%, #0b1120 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,128,25,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo above card */}
      <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 52, marginBottom: 28, position: 'relative', zIndex: 1 }} />

      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(26,34,53,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '36px 32px 32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Accent strip */}
        <div style={{
          position: 'absolute', top: 0, left: 24, right: 24, height: 3,
          background: 'linear-gradient(90deg, #FC8019, #ef4444)',
          borderRadius: '0 0 3px 3px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px' }}>
            Restaurant login
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
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
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit phone number"
              required
              maxLength={10}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
                background: 'rgba(15,23,41,0.6)',
                color: '#f1f5f9',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                letterSpacing: '0.05em',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(252,128,25,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Security PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit PIN"
              required
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
                background: 'rgba(15,23,41,0.6)',
                color: '#f1f5f9',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                letterSpacing: '0.25em',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(252,128,25,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.12)', padding: '10px 14px', borderRadius: 10, margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !phone || !pin}
            style={{
              padding: '14px',
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
              background: loading ? '#475569' : 'linear-gradient(135deg, #FC8019, #ef4444)',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'opacity 0.2s',
              opacity: loading || !phone || !pin ? 0.5 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 24, fontWeight: 500 }}>
          Powered by Foodnomix
        </p>
      </div>
    </div>
  )
}
