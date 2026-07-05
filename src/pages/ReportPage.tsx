import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useRestaurantByCode } from '../hooks/useRestaurantByCode'
import { useReport } from '../hooks/useReport'
import { MONTH_NAMES, PLATFORM_COLOR } from '../lib/format'
import Loader from '../components/ui/Loader'
import PayoutBreakdown from '../components/dashboard/PayoutBreakdown'
import PerformanceOverview from '../components/dashboard/PerformanceOverview'
import TopItems from '../components/dashboard/TopItems'
import UniqueItems from '../components/dashboard/UniqueItems'
import ItemLedger from '../components/dashboard/ItemLedger'
import type { Platform } from '../types'

const TEXTURE: React.CSSProperties = {
  backgroundColor: '#f5f4f2',
  backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const PLATFORM_ORDER: Platform[] = ['swiggy', 'zomato']

export default function ReportPage() {
  const { code = '' } = useParams<{ code: string }>()
  const [showLoader, setShowLoader] = useState(true)
  const [platform, setPlatform] = useState<Platform>('swiggy')
  const prevPlatformRef = useRef<Platform>('swiggy')

  const { restaurant, loading: restLoading, notFound } = useRestaurantByCode(code)
  const { report, payout, performance, topItems, ledger, loading: dataLoading } = useReport(
    restaurant?.id ?? '',
    platform
  )

  const color = PLATFORM_COLOR[platform]
  const dataLoaded = !restLoading && !dataLoading

  // Direction for slide animation
  const direction = PLATFORM_ORDER.indexOf(platform) > PLATFORM_ORDER.indexOf(prevPlatformRef.current) ? 1 : -1

  function switchPlatform(p: Platform) {
    prevPlatformRef.current = platform
    setPlatform(p)
  }

  // ── Not found ─────────────────────────────────────────────────────────
  if (!restLoading && !showLoader && notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', ...TEXTURE }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={34} color="#dc2626" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Report not found</h1>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            The code <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#1e293b' }}>{code}</code> doesn't match any restaurant. Please check your link.
          </p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 32, fontWeight: 600 }}>Powered by Foodnomix</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...TEXTURE }}>

      {/* ── Loader overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showLoader && <Loader onDone={() => setShowLoader(false)} />}
      </AnimatePresence>

      {/* ── Header: logo only ────────────────────────────────────────── */}
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
        }}
      >
        <img src="/bytevalue-logo.png" alt="ByteValue" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
      </motion.header>

      {/* ── Restaurant name + platform switcher ──────────────────────── */}
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
          {restLoading ? (
            <div style={{ height: 26, width: 180, background: '#f1f5f9', borderRadius: 8 }} />
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 'clamp(1.1rem,3.5vw,1.55rem)', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2, overflowWrap: 'break-word' }}
            >
              {restaurant?.name}
            </motion.h1>
          )}
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

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '28px 20px 24px' }}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* Data loading spinner (after loader, while fetching) */}
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
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>📊</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: '0 0 8px' }}>
                No {platform === 'swiggy' ? 'Swiggy' : 'Zomato'} data yet
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No report has been uploaded for this platform.</p>
            </motion.div>
          )}

          {/* Dashboard */}
          {!showLoader && dataLoaded && report && (
            <motion.div
              key={`${restaurant?.id}-${platform}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 48, scale: 0.97, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: direction * -48, scale: 0.97, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 36 }}
            >
              {/* Date range pill */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
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
                    {new Date(report.date_from).getDate()} {MONTH_NAMES[report.month]} – {new Date(report.date_to).getDate()} {MONTH_NAMES[report.month]} {report.year}
                  </span>
                </div>
              </motion.div>

              <PayoutBreakdown periods={payout} accentColor={color} platform={platform} />
              <PerformanceOverview periods={performance} accentColor={color} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TopItems items={topItems} accentColor={color} />
                <UniqueItems count={ledger.length} />
                <ItemLedger items={ledger} accentColor={color} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
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
