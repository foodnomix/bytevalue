import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function createSignatureSound() {
  try {
    const ctx = new AudioContext()

    // Buildup: rising hum 0-2.5s
    const t = ctx.currentTime

    const hum = ctx.createOscillator()
    const humGain = ctx.createGain()
    hum.type = 'sine'
    hum.frequency.setValueAtTime(110, t)
    hum.frequency.linearRampToValueAtTime(165, t + 2.5)
    humGain.gain.setValueAtTime(0, t)
    humGain.gain.linearRampToValueAtTime(0.03, t + 0.8)
    humGain.gain.linearRampToValueAtTime(0.06, t + 2.2)
    humGain.gain.linearRampToValueAtTime(0.08, t + 2.5)
    humGain.gain.linearRampToValueAtTime(0, t + 2.65)
    hum.connect(humGain).connect(ctx.destination)
    hum.start()
    hum.stop(t + 2.7)

    const shimmerBuild = ctx.createOscillator()
    const shimmerBuildGain = ctx.createGain()
    shimmerBuild.type = 'triangle'
    shimmerBuild.frequency.setValueAtTime(440, t + 1.0)
    shimmerBuild.frequency.linearRampToValueAtTime(660, t + 2.5)
    shimmerBuildGain.gain.setValueAtTime(0, t)
    shimmerBuildGain.gain.linearRampToValueAtTime(0, t + 1.0)
    shimmerBuildGain.gain.linearRampToValueAtTime(0.015, t + 1.8)
    shimmerBuildGain.gain.linearRampToValueAtTime(0.035, t + 2.4)
    shimmerBuildGain.gain.linearRampToValueAtTime(0, t + 2.6)
    shimmerBuild.connect(shimmerBuildGain).connect(ctx.destination)
    shimmerBuild.start()
    shimmerBuild.stop(t + 2.7)

    return {
      playThud() {
        const now = ctx.currentTime

        // Deep thud
        const thud = ctx.createOscillator()
        const thudGain = ctx.createGain()
        thud.type = 'sine'
        thud.frequency.setValueAtTime(90, now)
        thud.frequency.exponentialRampToValueAtTime(40, now + 0.5)
        thudGain.gain.setValueAtTime(0, now)
        thudGain.gain.linearRampToValueAtTime(0.22, now + 0.025)
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
        thud.connect(thudGain).connect(ctx.destination)

        // Warm confirmation tone
        const tone = ctx.createOscillator()
        const toneGain = ctx.createGain()
        tone.type = 'triangle'
        tone.frequency.setValueAtTime(220, now)
        toneGain.gain.setValueAtTime(0, now)
        toneGain.gain.linearRampToValueAtTime(0.1, now + 0.08)
        toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9)
        tone.connect(toneGain).connect(ctx.destination)

        // Bright ding
        const ding = ctx.createOscillator()
        const dingGain = ctx.createGain()
        ding.type = 'sine'
        ding.frequency.setValueAtTime(660, now)
        dingGain.gain.setValueAtTime(0, now)
        dingGain.gain.linearRampToValueAtTime(0.06, now + 0.06)
        dingGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
        ding.connect(dingGain).connect(ctx.destination)

        // High shimmer
        const shimmer = ctx.createOscillator()
        const shimmerGain = ctx.createGain()
        shimmer.type = 'sine'
        shimmer.frequency.setValueAtTime(1320, now)
        shimmerGain.gain.setValueAtTime(0, now)
        shimmerGain.gain.linearRampToValueAtTime(0.018, now + 0.1)
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
        shimmer.connect(shimmerGain).connect(ctx.destination)

        ;[thud, tone, ding, shimmer].forEach(o => { o.start(); o.stop(now + 1.2) })
        setTimeout(() => ctx.close(), 2000)
      },
    }
  } catch {
    return null
  }
}

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
    const sound = createSignatureSound()
    const thudTimer = setTimeout(() => sound?.playThud(), 2500)

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

    return () => { clearInterval(tick); clearTimeout(thudTimer) }
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
