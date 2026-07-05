import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import type { TopItem } from '../../types'

interface Props {
  items: TopItem[]
  accentColor: string
}

const RANK_COLORS = ['#FC8019', '#64748b', '#64748b', '#64748b', '#64748b']

export default function TopItems({ items, accentColor }: Props) {
  const [fortnight, setFortnight] = useState<1 | 2>(1)

  const visible = items.filter(i => i.fortnight === fortnight).sort((a, b) => a.rank - b.rank)
  const maxUnits = Math.max(...visible.map(i => i.units))

  return (
    <section>
      <SectionHeading title="Top 5 Items" accentColor={accentColor} />

      {/* Fortnight switcher */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 14, padding: 4, width: 'fit-content', marginBottom: 18 }}>
        {([1, 2] as const).map(f => (
          <button
            key={f}
            onClick={() => setFortnight(f)}
            style={{
              padding: '7px 18px',
              borderRadius: 10,
              border: '1px solid transparent',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: fortnight === f ? 'linear-gradient(135deg,#0f172a,#1e293b)' : 'transparent',
              color: fortnight === f ? '#fff' : '#64748b',
              boxShadow: fortnight === f ? '0 4px 12px rgba(15,23,42,0.25)' : 'none',
            }}
          >
            {f === 1 ? '1st – 15th May' : '16th – 31st May'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${accentColor},#ea580c)`, padding: '14px 22px' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            May 2026 · {fortnight === 1 ? '1st – 15th' : '16th – 31st'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={fortnight}
            initial={{ opacity: 0, x: fortnight === 1 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: fortnight === 1 ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {visible.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                style={{ padding: '14px 22px', borderBottom: i < visible.length - 1 ? '1px solid #f8fafc' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: i === 0 ? '#fff7ed' : '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: RANK_COLORS[i],
                  }}>{item.rank}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item_name}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', background: '#f1f5f9', borderRadius: 10, padding: '4px 12px', flexShrink: 0 }}>{item.units}</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginLeft: 40 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.units / maxUnits) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: [0.34, 1.1, 0.64, 1] }}
                    style={{ height: '100%', background: i === 0 ? accentColor : '#cbd5e1', borderRadius: 4 }}
                  />
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  )
}
