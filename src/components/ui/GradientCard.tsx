import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  gradient: string
  children: ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export default function GradientCard({ gradient, children, delay = 0, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.34, 1.1, 0.64, 1] }}
      style={{
        background: gradient,
        borderRadius: 20,
        padding: '20px 18px',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}
