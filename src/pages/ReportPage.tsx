import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useReport } from '../hooks/useReport'
import { useReportList } from '../hooks/useReportList'
import { MONTH_NAMES, PLATFORM_COLOR } from '../lib/format'
import Loader from '../components/ui/Loader'
import PayoutBreakdown from '../components/dashboard/PayoutBreakdown'
import PerformanceOverview from '../components/dashboard/PerformanceOverview'
import TopItems from '../components/dashboard/TopItems'
import UniqueItems from '../components/dashboard/UniqueItems'
import ItemLedger from '../components/dashboard/ItemLedger'
import CardExpander from '../components/ui/CardExpander'
import type { Platform } from '../types'

const TEXTURE: React.CSSProperties = {
  backgroundColor: '#f5f4f2',
  backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const PLATFORM_ORDER: Platform[] = ['swiggy', 'zomato']

export default function ReportPage() {
  const { user, logout } = useAuth()
  const [showLoader, setShowLoader] = useState(true)
  const [platform, setPlatform] = useState<Platform>('swiggy')
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>()
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const [showHistory, setShowHistory] = useState(false)
  const prevPlatformRef = useRef<Platform>('swiggy')

  const restaurantId = user?.type === 'restaurant' ? user.id : ''
  const restaurantName = user?.type === 'restaurant' ? user.name : ''

  const { report, payout, performance, topItems, ledger, loading: dataLoading } = useReport(
    restaurantId,
    platform,
    selectedMonth,
    selectedYear,
  )

  const { reports: reportList } = useReportList(restaurantId)

  const color = PLATFORM_COLOR[platform]
  const dataLoaded = !dataLoading

  const direction = PLATFORM_ORDER.indexOf(platform) > PLATFORM_ORDER.indexOf(prevPlatformRef.current) ? 1 : -1

  function switchPlatform(p: Platform) {
    prevPlatformRef.current = platform
    setPlatform(p)
    setSelectedMonth(undefined)
    setSelectedYear(undefined)
  }

  function selectReport(month: number, year: number) {
    setSelectedMonth(month)
    setSelectedYear(year)
    setShowHistory(false)
  }

  const historyForPlatform = reportList.filter(r => r.platform === platform)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...TEXTURE }}>

      {/* Loader overlay */}
      <AnimatePresence>
        {showLoader && <Loader onDone={() => setShowLoader(false)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          background: '#0b1120',
          padding: '13px 24px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}
      >
        <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
        {user && (
          <button
            onClick={logout}
            style={{
              position: 'absolute',
              right: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        )}
      </motion.header>

      {/* Restaurant name + platform switcher */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        style={{
          background: '#fff',
          borderBottom: '1px solid #ede9e4',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 3px' }}>Restaurant</p>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(1.1rem,3.5vw,1.55rem)', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2, overflowWrap: 'break-word' }}
          >
            {restaurantName}
          </motion.h1>
        </div>

        {/* Platform tabs */}
        <motion.div
          animate={{ background: platform === 'swiggy' ? '#fff4ec' : '#fff0f1' }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', gap: 4, borderRadius: 16, padding: '4px', flexShrink: 0, border: `1.5px solid ${PLATFORM_COLOR[platform]}33` }}
        >
          {(['swiggy', 'zomato'] as Platform[]).map(p => {
            const pc = PLATFORM_COLOR[p]
            const active = platform === p
            return (
              <motion.button
                key={p}
                onClick={() => switchPlatform(p)}
                whileHover={{ scale: active ? 1 : 1.04 }}
                whileTap={{ scale: 0.93 }}
                style={{
                  position: 'relative',
                  padding: '9px 26px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  zIndex: 1,
                  letterSpacing: '0.01em',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="platform-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${pc}, ${pc}cc)`,
                      borderRadius: 12,
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="platform-glow"
                    style={{
                      position: 'absolute', inset: -2,
                      borderRadius: 14,
                      background: `${pc}30`,
                      filter: 'blur(8px)',
                      zIndex: -2,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                  />
                )}
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            )
          })}
        </motion.div>
      </motion.div>

      {/* Main content */}
      <div style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '28px 20px 24px' }}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* Data loading spinner */}
          {!showLoader && !dataLoaded && (
            <motion.div key="spinner"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${color}33`, borderTopColor: color }}
              />
            </motion.div>
          )}

          {/* No report */}
          {!showLoader && dataLoaded && !report && (
            <motion.div key="no-report"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '100px 20px' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                <AlertCircle size={28} color="#94a3b8" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: '0 0 8px' }}>
                No {platform === 'swiggy' ? 'Swiggy' : 'Zomato'} data yet
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No report has been uploaded for this platform.</p>
            </motion.div>
          )}

          {/* Dashboard */}
          {!showLoader && dataLoaded && report && (
            <motion.div
              key={`${restaurantId}-${platform}-${report.month}-${report.year}`}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 36 }}
            >
              {/* Date range pill + history dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: platform === 'swiggy' ? '#fff7ed' : '#fff1f2',
                  border: `1px solid ${color}44`, borderRadius: 999,
                  padding: '5px 14px',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: platform === 'swiggy' ? '#9a3412' : '#881337' }}>
                    {platform === 'swiggy' ? 'Swiggy' : 'Zomato'} Report
                  </span>
                  <span style={{ color: `${color}66` }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: platform === 'swiggy' ? '#7c2d12' : '#9f1239' }}>
                    {MONTH_NAMES[report.month]} {report.year}
                  </span>
                </div>

                {/* History button */}
                {historyForPlatform.length > 1 && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999,
                        padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      Previous months
                      <ChevronDown size={12} style={{ transform: showHistory ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
                    </button>
                    {showHistory && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                        padding: 6, minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      }}>
                        {historyForPlatform.map(r => (
                          <button
                            key={r.id}
                            onClick={() => selectReport(r.month, r.year)}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '8px 12px', border: 'none', borderRadius: 8,
                              background: r.month === report.month && r.year === report.year ? `${color}15` : 'transparent',
                              color: '#1e293b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            {MONTH_NAMES[r.month]} {r.year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              <CardExpander
                title="Payout Breakdown"
                description="A step-by-step view of your money: what customers paid, what was deducted, and what reached your bank account."
                accentColor={color}
                helpItems={platform === 'zomato' ? [
                  { label: 'Net Order Value', text: 'What your customers actually paid for your food: sales after discounts, plus GST. This is the starting point of your payout.' },
                  { label: 'Base Commission', text: "Zomato's commission on your orders, at your agreed rate. Calculated on the commissionable value." },
                  { label: 'Payment Fee', text: 'What Zomato charges for collecting online payments from your customers.' },
                  { label: 'Service Fee (Total)', text: "Everything Zomato charged for its service: commission, long-distance and payment fees, after any fee discounts." },
                  { label: 'GST on Zomato Fees', text: "The 18% GST charged on Zomato's service fee. This is separate from the GST your customers pay on food." },
                  { label: 'Ads & Promotions', text: 'What you spent on Zomato ads and promotions to bring in more orders.' },
                  { label: 'Total Zomato Take', text: "Everything that went to Zomato: the service fee, the GST on it, and ads." },
                  { label: 'Govt Taxes', text: "Taxes taken out of your payout: customer GST, GST on Zomato's fee, and TDS." },
                  { label: 'TDS (Income Tax)', text: 'Income tax (0.1% of net sales) deducted on your behalf. You can claim it back when you file your income tax return.' },
                  { label: 'Customer Complaints', text: 'Amounts recovered from you for customer complaints, such as missing or wrong items.' },
                  { label: 'Cancellation Credits', text: 'Money Zomato paid you for orders cancelled after you accepted them. Added to your payout.' },
                  { label: 'Your Bank Payout', text: 'The final amount Zomato credits to your bank account for the month.' },
                  { label: 'Retained %', text: 'Out of every ₹100 of net sales, how much reached your bank account.' },
                ] : [
                  { label: 'Net Order Value', text: 'What your customers actually paid for your food: sales after discounts, plus GST. This is the starting point of your payout.' },
                  { label: 'Swiggy Fees (Total)', text: "Everything Swiggy charged for its service, such as commission and payment collection." },
                  { label: 'GST on Swiggy Fees', text: "The GST charged on Swiggy's fees. This is separate from the GST your customers pay on food." },
                  { label: 'Ads & Promotions', text: 'What you spent on Swiggy ads and promotions, plus other Swiggy charges.' },
                  { label: 'Govt Taxes', text: "Taxes taken out of your payout: customer GST, GST on Swiggy's fees, and TDS." },
                  { label: 'TDS (Income Tax)', text: 'Income tax deducted on your behalf. You can claim it back when you file your income tax return.' },
                  { label: 'Complaints & Cancellations', text: 'Amounts deducted for customer complaints and for cancellations charged to you.' },
                  { label: 'Your Bank Payout', text: 'The final amount Swiggy credits to your bank account for this period.' },
                  { label: 'Retained %', text: 'Out of every ₹100 of net sales, how much reached your bank account.' },
                ]}
              >
                <PayoutBreakdown periods={payout} accentColor={color} platform={platform} />
              </CardExpander>

              <CardExpander
                title="Performance Overview"
                description="Tracks your order volume and revenue for the selected settlement period."
                accentColor={color}
                helpItems={platform === 'zomato' ? [
                  { label: 'Total Orders', text: 'Every order placed with you on Zomato this month, delivered or cancelled.' },
                  { label: 'Delivered', text: 'Orders that reached the customer. All sales figures on this page are based on these.' },
                  { label: 'Cancelled', text: "Orders cancelled or rejected before delivery. They don't count towards your sales." },
                  { label: 'Avg Order Value', text: 'What a customer paid you on an average delivered order, including GST.' },
                  { label: 'Gross Subtotal', text: 'The menu value of everything you delivered, before any discounts.' },
                  { label: 'Total Discounts', text: 'Discounts you funded: promo codes, BOGO, freebie and Gold offers, and relisting discounts.' },
                  { label: 'Packaging', text: 'Packaging charges your customers paid on delivered orders.' },
                  { label: 'Customer GST', text: 'The 5% GST your customers paid on their food. Zomato pays it to the government for you.' },
                  { label: 'Net Sales', text: 'Your food sales after discounts, without GST. This is what your earnings are measured against.' },
                ] : [
                  { label: 'Total Orders', text: 'Every order placed with you on Swiggy in this period, delivered or cancelled.' },
                  { label: 'Delivered', text: 'Orders that reached the customer. All sales figures on this page are based on these.' },
                  { label: 'Cancelled', text: "Orders cancelled before delivery. They don't count towards your sales." },
                  { label: 'Avg Order Value', text: 'What a customer paid you on an average delivered order, including GST.' },
                  { label: 'Subtotal', text: 'The menu value of everything you delivered, before any discounts.' },
                  { label: 'Total Discounts', text: 'Your share of the discounts and offers given to customers.' },
                  { label: 'Packaging', text: 'Packaging charges your customers paid on delivered orders.' },
                  { label: 'Customer GST', text: 'The GST your customers paid on their food. Swiggy pays it to the government for you.' },
                  { label: 'Net Sales', text: 'Your food sales after discounts, without GST. This is what your earnings are measured against.' },
                ]}
              >
                <PerformanceOverview periods={performance} accentColor={color} platform={platform} />
              </CardExpander>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CardExpander
                  title="Top 5 Items"
                  description="Your five best-selling menu items ranked by units sold during each fortnight. The bar width shows each item's relative share compared to the top seller. Switch between the first half (1st to 15th) and second half (16th to end) of the month."
                  accentColor={color}
                >
                  <TopItems items={topItems} accentColor={color} month={report.month} year={report.year} />
                </CardExpander>

                <CardExpander
                  title="Unique Items Sold"
                  description="The total number of distinct menu items that received at least one order during this period. A higher number means more of your menu is getting discovered by customers."
                  accentColor={color}
                >
                  <UniqueItems count={ledger.length} month={report.month} year={report.year} />
                </CardExpander>

                <ItemLedger items={ledger} accentColor={color} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '14px 24px',
        borderTop: '1px solid #ede9e4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Powered by</span>
          <img
            src="/foodnomix-logo.png"
            alt="Foodnomix"
            style={{ height: 18, width: 'auto', objectFit: 'contain', opacity: 0.7 }}
            onError={e => {
              const t = e.currentTarget
              t.style.display = 'none'
              const fb = document.createElement('span')
              fb.textContent = 'Foodnomix'
              fb.style.cssText = 'font-size:13px;font-weight:800;color:#1B2A4A;'
              t.parentNode?.insertBefore(fb, t.nextSibling)
            }}
          />
        </div>
      </footer>
    </div>
  )
}
