import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  sub?: ReactNode
  labelColor?: string
  delay?: number
  accentColor?: string
  stripColor?: string
}

export default function StatCard({ label, value, sub, labelColor, delay = 0, accentColor, stripColor }: Props) {
  // Label uses card-specific color (stripColor), then explicit labelColor, then platform accent, then gray
  const headingColor = stripColor ?? labelColor ?? accentColor ?? '#64748b'

  // Card background: subtle platform gradient
  const bg = accentColor
    ? `linear-gradient(140deg, ${accentColor}12 0%, ${accentColor}05 55%, #ffffff 100%)`
    : '#fff'

  const borderColor = accentColor ? `${accentColor}28` : '#ede9e4'
  const shadow = accentColor
    ? `0 2px 14px ${accentColor}0d, 0 1px 3px rgba(0,0,0,0.04)`
    : '0 1px 4px rgba(0,0,0,0.04)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.34, delay, ease: 'easeOut' }}
      style={{
        background: bg,
        borderRadius: 18,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        padding: '16px 18px',
      }}
    >
      <p style={{ fontSize: 10, fontWeight: 800, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{label}</p>
      <div style={{ fontSize: 'clamp(0.88rem, 3.5vw, 1.65rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8 }}>{sub}</div>}
    </motion.div>
  )
}
