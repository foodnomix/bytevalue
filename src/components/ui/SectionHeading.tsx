import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'

interface Props {
  title: string
  tooltip?: string
  accentColor?: string
}

export default function SectionHeading({ title, tooltip, accentColor = '#FC8019' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <motion.div
      className="flex items-center gap-3 mb-5"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ position: 'relative' }}
      ref={ref}
    >
      <div style={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(${accentColor}, #ef4444)`, flexShrink: 0 }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{title}</h2>

      {tooltip && (
        <button
          onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="More info"
        >
          <Info size={15} style={{ color: open ? accentColor : '#94a3b8', transition: 'color 0.2s' }} />
        </button>
      )}

      {!tooltip && <Info size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />}

      <AnimatePresence>
        {open && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 10,
              background: '#0d1829',
              borderRadius: 14,
              padding: '14px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              border: `1px solid ${accentColor}33`,
              zIndex: 50,
              width: 'min(320px, 90vw)',
            }}
          >
            {/* Arrow */}
            <div style={{
              position: 'absolute', top: -6, left: 28,
              width: 12, height: 12,
              background: '#0d1829',
              border: `1px solid ${accentColor}33`,
              borderRight: 'none', borderBottom: 'none',
              transform: 'rotate(45deg)',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', margin: 0, lineHeight: 1.65 }}>
                {tooltip}
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, color: '#475569' }}
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
