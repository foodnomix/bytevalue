import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../ui/StatCard'
import SectionHeading from '../ui/SectionHeading'
import AnimatedNumber from '../ui/AnimatedNumber'
import { INR } from '../../lib/format'
import type { PerformancePeriod } from '../../types'

interface Props {
  periods: PerformancePeriod[]
  accentColor: string
}

const TAB_STYLE = (active: boolean, color: string) => ({
  padding: '7px 16px',
  borderRadius: 10,
  border: `1px solid ${active ? 'transparent' : '#e2e8f0'}`,
  fontSize: 11,
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  transition: 'all 0.2s',
  background: active ? `linear-gradient(135deg,${color},#ef4444)` : '#fff',
  color: active ? '#fff' : '#64748b',
  boxShadow: active ? `0 4px 14px ${color}44` : 'none',
})

export default function PerformanceOverview({ periods, accentColor }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const p = periods[activeIdx]
  if (!p) return null

  return (
    <section>
      <SectionHeading title="Performance Overview" accentColor={accentColor} />

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }} className="scrollbar-hide">
        {periods.map((period, i) => (
          <button key={period.id} style={TAB_STYLE(activeIdx === i, accentColor)} onClick={() => setActiveIdx(i)}>
            {period.period_label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Key stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 10 }}>
            <StatCard
              label="Total Orders"
              labelColor={accentColor}
              accentColor={accentColor}
              stripColor={accentColor}
              value={<AnimatedNumber value={p.total_orders} />}
              delay={0}
              sub={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', borderRadius: 7, padding: '3px 8px' }}>{p.delivered} Delivered</span>
                  {p.cancelled > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626', borderRadius: 7, padding: '3px 8px' }}>{p.cancelled} Cancelled</span>}
                </div>
              }
            />
            <StatCard
              label="Gross Subtotal"
              accentColor={accentColor}
              value={<AnimatedNumber value={p.gross_subtotal} format={INR} />}
              delay={0.05}
              sub={<p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Pure item revenue</p>}
            />
            <StatCard
              label="Total Discounts"
              accentColor={accentColor}
              stripColor="#f43f5e"
              value={<AnimatedNumber value={p.discounts} format={INR} />}
              delay={0.1}
              sub={<p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{((p.discounts / p.gross_subtotal) * 100).toFixed(1)}% of subtotal</p>}
            />
            <StatCard
              label="Avg Order Value"
              labelColor="#059669"
              accentColor={accentColor}
              stripColor="#10b981"
              value={<AnimatedNumber value={p.aov} format={v => INR(Math.round(v))} />}
              delay={0.15}
              sub={<p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Based on Net Value (A)</p>}
            />
          </div>

          {/* Revenue formula */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #ede9e4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Revenue Breakdown</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' }}>
              {[
                { label: 'Subtotal', val: INR(p.gross_subtotal), color: '#1e293b' },
                { op: '+' },
                { label: 'Packaging', val: INR(p.packaging), color: '#1e293b' },
                { op: '−' },
                { label: 'Discounts', val: INR(p.discounts), color: '#dc2626' },
                { op: '+' },
                { label: 'Cust. GST', val: INR(p.cust_gst), color: '#2563eb' },
              ].map((item, i) =>
                'op' in item ? (
                  <span key={i} style={{ color: '#cbd5e1', fontWeight: 900, fontSize: 18 }}>{item.op}</span>
                ) : (
                  <div key={i} style={{ flex: 1, minWidth: 80 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 'clamp(0.8rem,2.8vw,1.1rem)', fontWeight: 700, color: item.color, overflowWrap: 'break-word' }}>{item.val}</p>
                  </div>
                )
              )}
              <span style={{ color: '#cbd5e1', fontWeight: 900, fontSize: 18 }}>=</span>
              <div style={{ flex: 1.5, minWidth: 130, background: 'linear-gradient(135deg,#059669,#10b981)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Customer Paid</p>
                <p style={{ fontSize: 'clamp(0.8rem,2.8vw,1.1rem)', fontWeight: 700, color: '#fff', overflowWrap: 'break-word' }}>{INR(p.gross_subtotal + p.packaging - p.discounts + p.cust_gst)}</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly payout mini-waterfall (non-overall) */}
          {activeIdx > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Period Context</p>
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>See Payout Breakdown → {p.period_label} for detailed settlement figures.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
