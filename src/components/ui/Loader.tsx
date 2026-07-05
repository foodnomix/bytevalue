import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('Fetching report data')

  const labels = [
    'Fetching report data',
    'Calculating settlements',
    'Analysing item performance',
    'Building your dashboard',
  ]

  useEffect(() => {
    const duration = 3000
    const start = Date.now()

    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min((elapsed / duration) * 100, 100)
      setProgress(p)
      const idx = Math.min(Math.floor((elapsed / duration) * labels.length), labels.length - 1)
      setLabel(labels[idx])
      if (p >= 100) {
        clearInterval(tick)
        setTimeout(onDone, 350)
      }
    }, 20)

    return () => clearInterval(tick)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#0b1120',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, overflow: 'hidden',
      }}
    >
      {/* Ambient rings */}
      {[280, 420, 560].map((size, i) => (
        <motion.div
          key={size}
          animate={{ scale: [1, 1.06, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 3 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: '1px solid #FC8019',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Logo */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: 44 }}
      >
        <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 68, width: 'auto', objectFit: 'contain' }} />
      </motion.div>

      {/* Loading label */}
      <motion.p
        key={label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 20, letterSpacing: '0.02em' }}
      >
        {label}…
      </motion.p>

      {/* Progress bar track */}
      <div style={{ width: 220, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #FC8019, #ef4444)',
            borderRadius: 99,
            width: `${progress}%`,
          }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* Percent */}
      <p style={{ color: '#334155', fontSize: 11, fontWeight: 700, marginTop: 10 }}>
        {Math.round(progress)}%
      </p>
    </motion.div>
  )
}
