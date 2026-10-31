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

const n = (v: number | null | undefined) => v ?? 0

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      padding: '10px 16px 8px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
      <p style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>{text}</p>
    </div>
  )
}

function LedgerRow({ label, value, sign, highlight, last, sub }: {
  label: string
  value: number
  sign?: '+' | '-' | null
  highlight?: boolean
  last?: boolean
  sub?: string
}) {
  const signColor = sign === '-' ? '#dc2626' : sign === '+' ? '#059669' : '#1e293b'
  const bgColor = sign === '-' ? '#fff1f2' : sign === '+' ? '#f0fdf4' : '#f8fafc'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
      borderBottom: last ? 'none' : '1px solid #f8fafc',
      background: highlight ? '#fefce8' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: bgColor, color: signColor,
          fontSize: 12, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {sign ?? '='}
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</span>
          {sub && <p style={{ fontSize: 9, fontWeight: 500, color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.4 }}>{sub}</p>}
        </div>
      </div>
      <span style={{
        fontSize: 13, fontWeight: 800, color: signColor,
        letterSpacing: '-0.01em', flexShrink: 0, marginLeft: 8,
      }}>
        {sign === '-' && '- '}<AnimatedNumber value={Math.abs(value)} format={INR} />
      </span>
    </div>
  )
}

function PctBadge({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      borderRadius: 7, padding: '3px 9px',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>{value}%</span>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#64748b' }}>{label}</span>
    </div>
  )
}

export default function PayoutBreakdown({ periods, accentColor, platform }: Props) {
  const overall = periods.find(p => p.sort_order === 0)
  if (!overall) return null

  const z = platform === 'zomato'
  const retainedPct = overall.retained_pct ?? overall.net_payout_pct

  const donutSegments = [
    { value: retainedPct,              color: '#10b981' },
    { value: overall.platform_fee_pct, color: 'rgba(255,255,255,0.18)' },
    { value: overall.govt_tax_pct,     color: 'rgba(255,255,255,0.10)' },
    { value: overall.ads_spend_pct,    color: 'rgba(255,255,255,0.06)' },
  ]

  const hasFeeBreakdown = n(overall.base_fee) > 0 || n(overall.payment_fee) > 0
  const hasPlatformGst = n(overall.platform_gst) > 0
  const hasTds = n(overall.tds) > 0
  const hasOtherDeductions = n(overall.other_deductions) > 0
  const hasRefunds = n(overall.refunds) > 0
  const hasComplaints = n(overall.complaints) > 0
  const hasPlatformTake = n(overall.platform_take) > 0

  return (
    <section>
      <SectionHeading
        title="Payout Breakdown"
        accentColor={accentColor}
        tooltip="A step-by-step view of your money: what customers paid, what was deducted, and what reached your bank account."
      />

      {/* Money Statement */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
        style={{
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #ede9e4',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
            Payout Statement
          </p>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{overall.period_label}</span>
        </div>

        {/* Section 1: Your Revenue */}
        <SectionLabel text="Your Revenue" color="#10b981" />
        <LedgerRow
          label="Net Order Value"
          value={overall.net_sales ?? overall.customer_paid}
          sub="What customers paid for your food"
        />

        {/* Section 2: Platform Charges */}
        <SectionLabel text={z ? 'Zomato Charges' : 'Swiggy Charges'} color="#f43f5e" />

        {hasFeeBreakdown && (
          <>
            <LedgerRow
              label={z ? 'Base Commission' : 'Commission'}
              value={n(overall.base_fee)}
              sign="-"
              sub={[
                overall.base_fee_pct ? `${overall.base_fee_pct}% commission rate` : '',
                n(overall.commissionable_value) > 0 ? `on ${INR(n(overall.commissionable_value))} commissionable value` : '',
              ].filter(Boolean).join(' · ') || undefined}
            />
            <LedgerRow
              label="Payment Fee"
              value={n(overall.payment_fee)}
              sign="-"
              sub={overall.payment_fee_pct ? `${overall.payment_fee_pct}% of customer payment` : undefined}
            />
          </>
        )}

        <LedgerRow
          label={z ? 'Service Fee (Total)' : 'Swiggy Fees (Total)'}
          value={overall.platform_fee}
          sign="-"
          highlight={hasFeeBreakdown}
          sub={`${overall.platform_fee_pct}% of revenue${hasFeeBreakdown ? '' : z ? ' -- commission + payment fees' : ' -- commission and payment collection'}`}
        />

        {hasPlatformGst && (
          <LedgerRow
            label={z ? 'GST on Zomato Fees' : 'GST on Swiggy Fees'}
            value={n(overall.platform_gst)}
            sign="-"
            sub="18% GST on the service fee"
          />
        )}

        <LedgerRow
          label="Ads & Promotions"
          value={overall.ads_spend}
          sign="-"
          sub={`${overall.ads_spend_pct}% of revenue`}
        />

        {hasPlatformTake && (
          <div style={{
            margin: '4px 12px 8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', margin: 0 }}>
                Total {z ? 'Zomato' : 'Swiggy'} Take
              </p>
              {overall.platform_take_pct != null && (
                <p style={{ fontSize: 9, fontWeight: 600, color: '#ef4444', margin: '2px 0 0' }}>
                  {overall.platform_take_pct}% of your net sales
                </p>
              )}
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#dc2626' }}>
              <AnimatedNumber value={n(overall.platform_take)} format={INR} />
            </span>
          </div>
        )}

        {/* Section 3: Taxes */}
        <SectionLabel text="Government Taxes" color="#f59e0b" />

        <LedgerRow
          label="Govt Taxes"
          value={overall.govt_tax}
          sign="-"
          sub={`${overall.govt_tax_pct}% of revenue`}
        />

        {hasTds && (
          <LedgerRow
            label="TDS (Income Tax)"
            value={n(overall.tds)}
            sign="-"
            sub="Claim it back when you file ITR"
            last
          />
        )}

        {/* Section 4: Adjustments (only if any exist) */}
        {(hasComplaints || hasOtherDeductions || hasRefunds) && (
          <>
            <SectionLabel text="Adjustments" color="#8b5cf6" />

            {hasComplaints && (
              <LedgerRow
                label={z ? 'Customer Complaints' : 'Complaints & Cancellations'}
                value={n(overall.complaints)}
                sign="-"
                sub={z ? 'Missing/wrong items deducted from payout' : 'Complaint and cancellation deductions'}
              />
            )}

            {hasOtherDeductions && (
              <LedgerRow
                label="Other Deductions"
                value={n(overall.other_deductions)}
                sign="-"
              />
            )}

            {hasRefunds && (
              <LedgerRow
                label={z ? 'Cancellation Credits' : 'Refunds'}
                value={n(overall.refunds)}
                sign="+"
                sub={z ? 'Paid to you for orders cancelled after acceptance' : 'Credits added back to your payout'}
                last
              />
            )}
          </>
        )}

        {/* Divider before payout */}
        <div style={{ height: 1, background: '#e2e8f0', margin: '4px 16px' }} />

        {/* Section 5: Payout summary badges */}
        <div style={{ padding: '10px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <PctBadge value={retainedPct} label="of net sales retained" />
          {overall.net_payout_pct != null && (
            <PctBadge value={overall.net_payout_pct} label="of customer payment retained" />
          )}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#f1f5f9', borderRadius: 7, padding: '3px 9px',
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8' }}>
              {periods.length - 1} settlement period{periods.length - 1 !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Final Net Payout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.15 }}
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
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          borderRadius: '20px 20px 0 0',
        }} />

        <div style={{
          position: 'absolute', bottom: -50, left: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: `${accentColor}0e`,
          pointerEvents: 'none',
        }} />

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>
            Your Bank Payout
          </p>
          <div style={{ fontSize: 'clamp(1.7rem, 5vw, 2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, overflowWrap: 'break-word' }}>
            <AnimatedNumber value={overall.net_payout} format={INR} duration={1100} />
          </div>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>
            {z
              ? 'Credited to your bank account by Zomato for the month.'
              : 'Credited to your bank account by Swiggy for this period.'}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>{retainedPct}% of revenue retained</span>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 140 }}>
          <DonutChart
            segments={donutSegments}
            size={88}
            strokeWidth={11}
            centerLabel={`${retainedPct}%`}
            centerSub="net"
          />
        </div>
      </motion.div>
    </section>
  )
}
