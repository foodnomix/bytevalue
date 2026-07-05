import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

interface Props {
  title: string
  tooltip?: string
  accentColor?: string
}

export default function SectionHeading({ title, accentColor = '#FC8019' }: Props) {
  return (
    <motion.div
      className="flex items-center gap-3 mb-5"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(${accentColor}, #ef4444)`, flexShrink: 0 }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{title}</h2>
      <Info size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
    </motion.div>
  )
}
