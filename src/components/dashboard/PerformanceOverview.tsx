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
      <SectionHeading
        title="Performance Overview"
        accentColor={accentColor}
        tooltip="Key order and revenue metrics for each settlement period — total orders, gross revenue, discounts applied, and average order value."
      />

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

          {/* Revenue breakdown — ledger style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #ede9e4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Card header */}
            <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Revenue Breakdown</p>
            </div>

            {/* Rows */}
            <div style={{ padding: '4px 0' }}>
              {[
                { label: 'Subtotal',     val: p.gross_subtotal, sign: null,  valColor: '#1e293b' },
                { label: 'Packaging',    val: p.packaging,      sign: '+',   valColor: '#1e293b' },
                { label: 'Discounts',    val: p.discounts,      sign: '−',   valColor: '#dc2626', negative: true },
                { label: 'Customer GST', val: p.cust_gst,       sign: '+',   valColor: '#2563eb' },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 20px',
                    borderBottom: i < 3 ? '1px solid #f8fafc' : 'none',
                  }}
                >
                  {/* Sign badge + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: row.sign === '−' ? '#fff1f2' : row.sign === '+' ? '#f0fdf4' : '#f8fafc',
                      color: row.sign === '−' ? '#dc2626' : row.sign === '+' ? '#059669' : '#94a3b8',
                      fontSize: 14, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {row.sign ?? '='}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{row.label}</span>
                  </div>

                  {/* Value */}
                  <span style={{ fontSize: 15, fontWeight: 800, color: row.valColor, letterSpacing: '-0.01em' }}>
                    <AnimatedNumber value={row.val} format={INR} />
                  </span>
                </div>
              ))}
            </div>

            {/* Customer Paid total */}
            <div style={{
              margin: '0 12px 12px',
              background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 60%, #fff 100%)`,
              border: `1.5px solid ${accentColor}28`,
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: `${accentColor}22`,
                  color: accentColor,
                  fontSize: 14, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  =
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Customer Paid</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: accentColor, letterSpacing: '-0.02em' }}>
                <AnimatedNumber value={p.gross_subtotal + p.packaging - p.discounts + p.cust_gst} format={INR} />
              </span>
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
