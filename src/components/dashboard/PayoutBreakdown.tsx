import { motion } from 'framer-motion'
import DonutChart from '../ui/DonutChart'
import SectionHeading from '../ui/SectionHeading'
import AnimatedNumber from '../ui/AnimatedNumber'
import { INR } from '../../lib/format'
import type { PayoutPeriod, Platform } from '../../types'

interface Props {
  periods: PayoutPeriod[]
  accentColor: string
  platform: Platform
}

const CARD_DEFS = [
  { key: 'customer_paid', label: 'Customer Paid', color: '#10b981', icon: '↑' },
  { key: 'platform_fee',  label: 'Platform Fee',  color: '#f43f5e', icon: '↓' },
  { key: 'govt_tax',      label: 'Govt. Taxes',   color: '#f59e0b', icon: '↓' },
  { key: 'ads_spend',     label: 'Ads & Promo',   color: '#8b5cf6', icon: '↓' },
] as const

export default function PayoutBreakdown({ periods, accentColor }: Props) {
  const overall = periods.find(p => p.sort_order === 0)
  if (!overall) return null

  const values: Record<string, { value: number; pct: number | null }> = {
    customer_paid: { value: overall.customer_paid, pct: null },
    platform_fee:  { value: overall.platform_fee,  pct: overall.platform_fee_pct },
    govt_tax:      { value: overall.govt_tax,       pct: overall.govt_tax_pct },
    ads_spend:     { value: overall.ads_spend,      pct: overall.ads_spend_pct },
  }

  const donutSegments = [
    { value: overall.net_payout_pct,   color: '#10b981' },
    { value: overall.platform_fee_pct, color: 'rgba(255,255,255,0.18)' },
    { value: overall.govt_tax_pct,     color: 'rgba(255,255,255,0.10)' },
    { value: overall.ads_spend_pct,    color: 'rgba(255,255,255,0.06)' },
  ]

  return (
    <section>
      <SectionHeading
        title="Payout Breakdown"
        accentColor={accentColor}
        tooltip="Shows how your customer payment is distributed — what you keep as net payout vs. what goes to platform fees, government taxes, and promotions."
      />

      {/* Deduction cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10, marginBottom: 10 }}>
        {CARD_DEFS.map((def, i) => {
          const { value, pct } = values[def.key]
          return (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.38, delay: i * 0.07, ease: [0.34, 1.1, 0.64, 1] }}
              style={{
                background: `linear-gradient(140deg, ${accentColor}12 0%, ${accentColor}05 55%, #ffffff 100%)`,
                borderRadius: 18,
                border: `1px solid ${accentColor}28`,
                boxShadow: `0 2px 14px ${accentColor}0d, 0 1px 3px rgba(0,0,0,0.04)`,
                padding: '16px 18px 18px',
              }}
            >
              {/* Top row: label + icon badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: def.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, lineHeight: 1.3 }}>{def.label}</p>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `${def.color}18`,
                  border: `1.5px solid ${def.color}30`,
                  color: def.color,
                  fontSize: 15, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 2px 8px ${def.color}20`,
                }}>{def.icon}</div>
              </div>

              {/* Value */}
              <div style={{ fontSize: 'clamp(0.9rem, 3vw, 1.55rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, overflowWrap: 'break-word' }}>
                <AnimatedNumber value={value} format={INR} />
              </div>

              {/* Percentage */}
              {pct !== null && (
                <p style={{ fontSize: 10, fontWeight: 700, color: `${def.color}bb`, marginTop: 6 }}>{pct}% of revenue</p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Final Net Payout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.28 }}
        style={{
          background: 'linear-gradient(135deg, #0d1829 0%, #1a2640 100%)',
          borderRadius: 20,
          padding: '22px 26px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 24,
          boxShadow: `0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Platform color top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Subtle ambient glow */}
        <div style={{
          position: 'absolute', bottom: -50, left: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: `${accentColor}0e`,
          pointerEvents: 'none',
        }} />

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>
            Final Net Payout
          </p>
          <div style={{ fontSize: 'clamp(1.7rem, 5vw, 2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, overflowWrap: 'break-word' }}>
            <AnimatedNumber value={overall.net_payout} format={INR} duration={1100} />
          </div>

          {/* Retention badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>{overall.net_payout_pct}% of revenue retained</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: '#64748b', borderRadius: 7, padding: '3px 9px' }}>
              {periods.length - 1} Settlement Periods
            </span>
          </div>
        </div>

        {/* Donut — always visible */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 140 }}>
          <DonutChart
            segments={donutSegments}
            size={88}
            strokeWidth={11}
            centerLabel={`${overall.net_payout_pct}%`}
            centerSub="net"
          />
        </div>
      </motion.div>
    </section>
  )
}
