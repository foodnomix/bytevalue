import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'

interface Props {
  count: number
}

export default function UniqueItems({ count }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 16, padding: '16px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ClipboardList size={22} color="#fff" />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Unique Items Sold</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{count} <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>items</span></p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>May 2026</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', marginTop: 2 }}>All Periods</p>
      </div>
    </motion.div>
  )
}
