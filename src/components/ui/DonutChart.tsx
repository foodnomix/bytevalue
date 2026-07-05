import { motion } from 'framer-motion'

interface Segment { value: number; color: string; label?: string }

interface Props {
  segments: Segment[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerSub?: string
}

export default function DonutChart({ segments, size = 120, strokeWidth = 14, centerLabel, centerSub }: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let offset = 0

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ
          const gap = circ - dash
          const currentOffset = -offset * (circ / total)
          offset += seg.value
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={currentOffset}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${gap}` }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            />
          )
        })}
      </svg>
      {(centerLabel || centerSub) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {centerLabel && <span style={{ color: '#fff', fontWeight: 900, fontSize: size * 0.145, lineHeight: 1 }}>{centerLabel}</span>}
          {centerSub && <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: size * 0.08, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{centerSub}</span>}
        </div>
      )}
    </div>
  )
}
