import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { INR } from '../../lib/format'
import type { LedgerItem } from '../../types'

interface Props {
  items: LedgerItem[]
  accentColor: string
}

function MarginBadge({ pct }: { pct: number }) {
  const s =
    pct >= 68 ? { bg: '#dcfce7', color: '#15803d' }
    : pct >= 60 ? { bg: '#fef9c3', color: '#a16207' }
    : { bg: '#fee2e2', color: '#b91c1c' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 800, borderRadius: 5,
      padding: '2px 5px', flexShrink: 0,
    }}>{pct}%</span>
  )
}

function Row({ item, rank, accentColor, dark }: {
  item: LedgerItem; rank: number; accentColor: string; dark?: boolean
}) {
  const textMain  = dark ? '#e2e8f0' : '#1e293b'
  const textMuted = dark ? '#64748b' : '#94a3b8'
  const textNum   = dark ? '#94a3b8' : '#64748b'
  const rowBorder = dark ? '#1e293b' : '#f5f4f2'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(rank * 0.015, 0.35) }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 16px',
        borderBottom: `1px solid ${rowBorder}`,
        overflow: 'hidden',
      }}
    >

      {/* Rank */}
      <span style={{
        width: 22, height: 22, borderRadius: 7,
        background: rank <= 3 ? `${accentColor}22` : (dark ? '#1e293b' : '#f5f4f2'),
        color: rank <= 3 ? accentColor : textMuted,
        fontSize: 10, fontWeight: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 1,
      }}>{rank}</span>

      {/* Name — single line, truncated */}
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: 12, fontWeight: 600, color: textMain,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        zIndex: 1,
      }}>{item.item_name}</span>

      {/* Units */}
      <span style={{
        fontSize: 12, fontWeight: 800, color: textNum,
        flexShrink: 0, zIndex: 1, minWidth: 28, textAlign: 'center',
      }}>{item.units_sold}</span>

      {/* Net/unit + margin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: textNum }}>{INR(item.net_per_unit)}</span>
        <MarginBadge pct={item.margin_pct} />
      </div>

      {/* Total payout */}
      <span style={{
        fontSize: 12, fontWeight: 900,
        color: dark ? '#6ee7b7' : '#059669',
        flexShrink: 0, zIndex: 1, minWidth: 64, textAlign: 'right',
      }}>{INR(item.total_net_payout)}</span>
    </motion.div>
  )
}

function ColumnHeaders({ dark }: { dark?: boolean }) {
  const c = dark ? '#334155' : '#94a3b8'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 16px',
      background: dark ? '#0d1829' : '#fafaf9',
      borderBottom: `1px solid ${dark ? '#1e293b' : '#ede9e4'}`,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <span style={{ width: 22, flexShrink: 0, fontSize: 9, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.1em' }}>#</span>
      <span style={{ flex: 1, fontSize: 9, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Menu Item</span>
      <span style={{ flexShrink: 0, minWidth: 28, textAlign: 'center', fontSize: 9, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Units</span>
      <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Net / Unit</span>
      <span style={{ flexShrink: 0, minWidth: 64, textAlign: 'right', fontSize: 9, fontWeight: 800, color: dark ? '#6ee7b7' : '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payout</span>
    </div>
  )
}

export default function ItemLedger({ items, accentColor }: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    if (fullscreen) {
      // Lock body scroll without breaking touch scroll inside the overlay
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
    }
  }, [fullscreen])

  return (
    <>
      <section>
        {/* Unified card: dark header + scrollable list */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #ede9e4' }}>

          {/* Header bar */}
          <div style={{
            background: '#0d1829',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ width: 3, height: 18, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
              <span style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 14 }}>Item Performance Ledger</span>
              <span style={{
                background: 'rgba(255,255,255,0.07)', color: '#475569',
                fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', flexShrink: 0,
              }}>{items.length} items</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, background: `${accentColor}dd` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFullscreen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: accentColor,
                color: '#fff', border: 'none',
                padding: '7px 14px', borderRadius: 10,
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Maximize2 size={12} />
              Full Screen
            </motion.button>
          </div>

          {/* Column headers + rows */}
          <div style={{ background: '#fff', maxHeight: 480, overflowY: 'auto' }} className="scrollbar-thin">
            <ColumnHeaders />
            {items.map((item, i) => (
              <Row key={item.id} item={item} rank={i + 1} accentColor={accentColor} />
            ))}
          </div>
        </div>
      </section>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60 }}
          >
            {/* Rotation lives on this inner div, not on the Framer Motion node */}
            <div className="fs-inner" style={{ width: '100%', height: '100%', background: '#0b1120', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: '#0d1829',
                padding: '12px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 3, height: 18, borderRadius: 2, background: accentColor }} />
                  <span style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 14 }}>Item Performance Ledger</span>
                  <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>Sorted by units sold ↓</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFullscreen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: accentColor, color: '#fff', border: 'none',
                    padding: '7px 14px', borderRadius: 10,
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  <X size={12} /> Close
                </motion.button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any, overscrollBehavior: 'contain' }} className="scrollbar-thin">
                <ColumnHeaders dark />
                {items.map((item, i) => (
                  <Row key={item.id} item={item} rank={i + 1} accentColor={accentColor} dark />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (orientation: portrait) {
          .fs-inner {
            width: 100vh !important;
            height: 100vw !important;
            position: absolute !important;
            top: calc((100vh - 100vw) / 2) !important;
            left: calc((100vw - 100vh) / 2) !important;
            transform: rotate(90deg) !important;
            transform-origin: center center !important;
          }
        }
      `}</style>
    </>
  )
}
