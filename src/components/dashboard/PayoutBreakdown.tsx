import { motion } from 'framer-motion'
import DonutChart from '../ui/DonutChart'
import SectionHeading from '../ui/SectionHeading'
import AnimatedNumber from '../ui/AnimatedNumber'
import CardExpander from '../ui/CardExpander'
import { INR } from '../../lib/format'
import type { PayoutPeriod, Platform } from '../../types'

interface Props {
  periods: PayoutPeriod[]
  accentColor: string
  platform: Platform
}

const n = (v: number | null | undefined) => v ?? 0

interface CardDef {
  key: string
  label: string
  value: number
  color: string
  icon: string
  subtitle: string
  pct: number | null
  popupTitle: string
  popupDesc: string
  mainValue: string
  helpItems: { label: string; text: string; value?: string }[]
}

export default function PayoutBreakdown({ periods, accentColor, platform }: Props) {
  const overall = periods.find(p => p.sort_order === 0)
  if (!overall) return null

  const z = platform === 'zomato'
  const retainedPct = overall.retained_pct ?? overall.net_payout_pct ?? 0

  const donutSegments = [
    { value: retainedPct ?? 0,              color: '#10b981' },
    { value: overall.platform_fee_pct ?? 0, color: 'rgba(255,255,255,0.18)' },
    { value: overall.govt_tax_pct ?? 0,     color: 'rgba(255,255,255,0.10)' },
    { value: overall.ads_spend_pct ?? 0,    color: 'rgba(255,255,255,0.06)' },
  ]

  // Card 1: Net Order Value
  const netOrderVal = overall.net_sales ?? overall.customer_paid

  // Card 2: Platform Charges (fees + platform GST combined)
  const platformTotal = overall.platform_fee + n(overall.platform_gst)

  // Card 3: Ads
  const adsVal = overall.ads_spend

  // Card 4: Govt Taxes (already includes TDS)
  const govtTotal = overall.govt_tax

  // Card 5: Cancellations (Zomato: other_deductions + refunds; Swiggy: complaints)
  const cancellationVal = z
    ? n(overall.other_deductions) + n(overall.refunds)
    : n(overall.complaints)

  // Govt tax breakdown
  const customerGst = overall.govt_tax - n(overall.tds)
  const restaurantGst = n(overall.platform_gst)

  // Customer point of view: what % of customer's spend reaches the restaurant
  const customerPovPct = overall.customer_paid
    ? Math.round((overall.net_payout / overall.customer_paid) * 1000) / 10
    : 0

  const cards: CardDef[] = [
    {
      key: 'net_order_value',
      label: 'Net Order Value',
      value: netOrderVal,
      color: '#10b981',
      icon: '↑',
      subtitle: 'What customers paid for your food',
      pct: null,
      popupTitle: 'Net Order Value',
      popupDesc: 'What your customers paid for your food, after discounts, plus GST. The starting point of your payout.',
      mainValue: INR(netOrderVal),
      helpItems: [
        { label: 'Net Order Value', value: INR(netOrderVal), text: 'Total amount customers paid after discounts, plus GST collected.' },
        ...(overall.net_sales !== overall.customer_paid ? [
          { label: 'Net Sales (without GST)', value: INR(overall.net_sales), text: 'Your food sales after discounts, without GST. Your earnings are measured against this number.' },
        ] : []),
      ],
    },
    {
      key: 'platform_charges',
      label: z ? 'Zomato Charges' : 'Swiggy Charges',
      value: platformTotal,
      color: '#f43f5e',
      icon: '↓',
      subtitle: z ? 'Commission, fees, and GST on fees' : 'Fees and GST on fees',
      pct: overall.platform_fee_pct,
      popupTitle: z ? 'Zomato Charges' : 'Swiggy Charges',
      popupDesc: z
        ? 'Commission, payment fees, and the GST charged on those fees.'
        : 'Service fees and the GST charged on those fees.',
      mainValue: INR(platformTotal),
      helpItems: z ? [
        ...(n(overall.base_fee) > 0 ? [
          { label: 'Base Commission', value: INR(n(overall.base_fee)),
            text: `Zomato's commission at your agreed rate.${overall.base_fee_pct ? ` ${overall.base_fee_pct}% commission rate.` : ''}${n(overall.commissionable_value) > 0 ? ` Calculated on ${INR(n(overall.commissionable_value))} commissionable value.` : ''}` },
        ] : []),
        ...(n(overall.payment_fee) > 0 ? [
          { label: 'Payment Fee', value: INR(n(overall.payment_fee)),
            text: `What Zomato charges for collecting online payments from your customers.${overall.payment_fee_pct ? ` ${overall.payment_fee_pct}% of customer payment.` : ''}` },
        ] : []),
        ...(!n(overall.base_fee) && !n(overall.payment_fee) ? [
          { label: 'Service Fee', value: INR(overall.platform_fee),
            text: `Everything Zomato charged for its service (commission, long-distance, and payment fees, after any fee discounts). ${overall.platform_fee_pct}% of revenue.` },
        ] : [
          { label: 'Service Fee (Total)', value: INR(overall.platform_fee),
            text: `Commission + payment fees combined. ${overall.platform_fee_pct}% of revenue.` },
        ]),
        ...(n(overall.platform_gst) > 0 ? [
          { label: 'GST on Zomato Fees', value: INR(n(overall.platform_gst)),
            text: "The 18% GST charged on Zomato's service fee." },
        ] : []),
      ] : [
        { label: 'Swiggy Fees', value: INR(overall.platform_fee),
          text: `Everything Swiggy charged for its service (commission and payment collection). ${overall.platform_fee_pct}% of revenue.` },
        ...(n(overall.platform_gst) > 0 ? [
          { label: 'GST on Swiggy Fees', value: INR(n(overall.platform_gst)),
            text: "The GST charged on Swiggy's fees." },
        ] : []),
      ],
    },
    {
      key: 'ads',
      label: 'Ads',
      value: adsVal,
      color: '#8b5cf6',
      icon: '↓',
      subtitle: z ? 'Spent on Zomato ads' : 'Spent on Swiggy ads',
      pct: overall.ads_spend_pct,
      popupTitle: 'Ads',
      popupDesc: z
        ? 'Your total spend on Zomato ads to bring in more orders.'
        : 'Your total spend on Swiggy ads and other platform charges.',
      mainValue: INR(adsVal),
      helpItems: [
        { label: 'Total Ad Spend', value: INR(adsVal),
          text: z
            ? 'Amount spent on Zomato ads this period.'
            : 'Amount spent on Swiggy ads and other charges this period.' },
        { label: 'Ads as % of Revenue', value: `${overall.ads_spend_pct ?? 0}%`,
          text: 'Your ad spend as a share of what customers paid.' },
      ],
    },
    {
      key: 'govt_taxes',
      label: 'Govt Taxes',
      value: govtTotal,
      color: '#f59e0b',
      icon: '↓',
      subtitle: 'Customer GST, restaurant GST, TDS',
      pct: overall.govt_tax_pct,
      popupTitle: 'Government Taxes',
      popupDesc: 'All taxes deducted from your payout, split by who they apply to.',
      mainValue: INR(govtTotal),
      helpItems: [
        { label: 'Govt Taxes (Total)', value: INR(govtTotal),
          text: `${overall.govt_tax_pct ?? 0}% of revenue.` },
        ...(customerGst > 0 ? [
          { label: 'GST Paid by Customer', value: INR(customerGst),
            text: 'The 5% GST your customers paid on their food. The platform collects this and deposits it to the government.' },
        ] : []),
        ...(restaurantGst > 0 ? [
          { label: 'GST Paid by Restaurant', value: INR(restaurantGst),
            text: z
              ? "18% GST charged on Zomato's service fee. You can claim this as input tax credit."
              : "GST charged on Swiggy's service fee. You can claim this as input tax credit." },
        ] : []),
        ...(n(overall.tds) > 0 ? [
          { label: 'TDS (Income Tax)', value: INR(n(overall.tds)),
            text: 'Income tax deducted at source (0.1% of net sales). Claim it back when you file your ITR.' },
        ] : []),
      ],
    },
  ]

  {
    const cancellationHelpItems: { label: string; text: string; value?: string }[] = z
      ? [
          ...(n(overall.other_deductions) > 0 ? [{
            label: 'Order Deductions', value: INR(n(overall.other_deductions)),
            text: 'Compensation for customer complaints, Hyperpure charges, and other order-level deductions.',
          }] : []),
          ...(n(overall.refunds) > 0 ? [{
            label: 'Cancellation Credits', value: `+${INR(n(overall.refunds))}`,
            text: 'Money paid to you for orders cancelled after you accepted them.',
          }] : []),
          ...(cancellationVal === 0 ? [{
            label: 'No Cancellations', value: INR(0),
            text: 'No cancellation or complaint deductions this period.',
          }] : []),
        ]
      : [
          { label: 'Complaints & Cancellations', value: INR(cancellationVal),
            text: cancellationVal > 0
              ? 'Amounts deducted for customer complaints and cancellations charged to you.'
              : 'No complaint or cancellation deductions this period.' },
        ]
    cards.push({
      key: 'cancellations',
      label: 'Cancellations',
      value: cancellationVal,
      color: '#ef4444',
      icon: '↓',
      subtitle: cancellationVal > 0 ? 'Complaint and cancellation deductions' : 'No deductions this period',
      pct: null,
      popupTitle: 'Cancellations',
      popupDesc: z
        ? 'Deductions for complaints, cancellations, and any credits paid back to you.'
        : 'Amounts deducted from your payout for customer complaints and order cancellations.',
      mainValue: INR(cancellationVal),
      helpItems: cancellationHelpItems,
    })
  }

  return (
    <section>
      <SectionHeading
        title="Payout Breakdown"
        accentColor={accentColor}
        tooltip="Where your revenue goes. Tap any card for details."
      />

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10, marginBottom: 10 }}>
        {cards.map((def, i) => (
          <CardExpander
            key={def.key}
            title={def.popupTitle}
            description={def.popupDesc}
            accentColor={def.color}
            mainValue={def.mainValue}
            helpItems={def.helpItems}
          >
            <motion.div
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
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: def.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, lineHeight: 1.3 }}>{def.label}</p>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `${def.color}18`, border: `1.5px solid ${def.color}30`,
                  color: def.color, fontSize: 15, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: `0 2px 8px ${def.color}20`,
                }}>{def.icon}</div>
              </div>

              <div style={{ fontSize: 'clamp(0.9rem, 3vw, 1.55rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, overflowWrap: 'break-word' }}>
                <AnimatedNumber value={def.value} format={INR} />
              </div>

              {def.pct !== null && (
                <p style={{ fontSize: 10, fontWeight: 700, color: `${def.color}bb`, marginTop: 6 }}>{def.pct}% of revenue</p>
              )}

              <p style={{ fontSize: 9, fontWeight: 500, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>{def.subtitle}</p>
            </motion.div>
          </CardExpander>
        ))}
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
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
          <p style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>
            Your Bank Payout
          </p>
          <div style={{ fontSize: 'clamp(1.7rem, 5vw, 2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, overflowWrap: 'break-word' }}>
            <AnimatedNumber value={overall.net_payout} format={INR} duration={1100} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#cbd5e1', marginTop: 8, lineHeight: 1.5 }}>
            {z
              ? 'Credited to your bank account by Zomato for the month.'
              : 'Credited to your bank account by Swiggy for this period.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>{retainedPct}% of revenue retained</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(96,165,250,0.14)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, padding: '4px 10px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60a5fa' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd' }}>{customerPovPct}% of customer spend</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: '#94a3b8', borderRadius: 7, padding: '3px 9px' }}>
              {periods.length - 1} Settlement Period{periods.length - 1 !== 1 ? 's' : ''}
            </span>
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
