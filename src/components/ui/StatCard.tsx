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

export default function StatCard({ label, value, sub, labelColor = '#64748b', delay = 0, accentColor, stripColor }: Props) {
  const base = accentColor
    ? accentColor === '#FC8019'
      ? 'linear-gradient(135deg, #fff0dd 0%, #fff 65%)'
      : 'linear-gradient(135deg, #fff1f2 0%, #fff 65%)'
    : '#fff'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.34, delay, ease: 'easeOut' }}
      style={{
        background: base,
        borderRadius: 16,
        border: '1px solid #ede9e4',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Optional left strip */}
      {stripColor && (
        <div style={{ width: 4, flexShrink: 0, background: stripColor, borderRadius: '16px 0 0 16px' }} />
      )}
      <div style={{ padding: '16px 18px', flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{label}</p>
        <div style={{ fontSize: 'clamp(0.88rem, 3.5vw, 1.65rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {value}
        </div>
        {sub && <div style={{ marginTop: 8 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}
