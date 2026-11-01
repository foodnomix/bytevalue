import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, LogOut, Archive, X, Calendar, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useReport } from '../hooks/useReport'
import { useReportList, type ReportGroup } from '../hooks/useReportList'
import { PLATFORM_COLOR, formatReportNo, formatDateRange } from '../lib/format'
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

/* ── Report Archive Modal ─────────────────────────────────────── */

function ReportArchiveModal({
  reports,
  currentReportNo,
  onSelect,
  onClose,
}: {
  reports: ReportGroup[]
  currentReportNo: number | undefined
  onSelect: (reportNo: number) => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    return () => {
      window.removeEventListener('keydown', onKey)
      const top = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, parseInt(top || '0') * -1)
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(11,17,32,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 51,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        padding: 20,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.7 }}
          style={{
            pointerEvents: 'auto',
            width: 'min(92vw, 480px)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 22,
            boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Archive size={16} color="#94a3b8" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>Report Archive</h2>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', margin: 0 }}>
                  {reports.length} report{reports.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, background: '#fee2e2' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={14} color="#64748b" />
            </motion.button>
          </div>

          {/* Column labels */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            padding: '10px 22px 8px',
            borderBottom: '1px solid #f8fafc',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Report</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Swiggy</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#E23744', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Zomato</span>
          </div>

          {/* Report list */}
          <div style={{ overflowY: 'auto', flex: 1 }} className="scrollbar-thin">
            {reports.map((g, i) => {
              const active = g.report_no === currentReportNo
              const swiggy = g.platforms.find(p => p.platform === 'swiggy')
              const zomato = g.platforms.find(p => p.platform === 'zomato')
              const isLatest = i === 0

              return (
                <motion.button
                  key={g.report_no}
                  onClick={() => onSelect(g.report_no)}
                  whileHover={{ background: active ? '#f0fdf4' : '#f8fafc' }}
                  whileTap={{ scale: 0.995 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    alignItems: 'center',
                    width: '100%', textAlign: 'left',
                    padding: '14px 22px',
                    border: 'none',
                    borderBottom: '1px solid #f8fafc',
                    background: active ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Report number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {active ? (
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                    ) : (
                      <Calendar size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                    )}
                    <div>
                      <span style={{
                        fontSize: 13, fontWeight: 800,
                        color: active ? '#059669' : '#1e293b',
                      }}>
                        {formatReportNo(g.report_no)}
                      </span>
                      {isLatest && (
                        <span style={{
                          fontSize: 8, fontWeight: 800, color: '#059669',
                          background: '#dcfce7', borderRadius: 4,
                          padding: '1px 5px', marginLeft: 6,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          verticalAlign: 'middle',
                        }}>Latest</span>
                      )}
                    </div>
                  </div>

                  {/* Swiggy dates */}
                  <span style={{ fontSize: 12, fontWeight: 600, color: swiggy ? '#475569' : '#d1d5db' }}>
                    {swiggy ? formatDateRange(swiggy.period_start_date, swiggy.period_end_date) : '-'}
                  </span>

                  {/* Zomato dates */}
                  <span style={{ fontSize: 12, fontWeight: 600, color: zomato ? '#475569' : '#d1d5db' }}>
                    {zomato ? formatDateRange(zomato.period_start_date, zomato.period_end_date) : '-'}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ── Main Page ────────────────────────────────────────────────── */

export default function ReportPage() {
  const { user, logout } = useAuth()
  const [showLoader, setShowLoader] = useState(true)
  const [platform, setPlatform] = useState<Platform>('swiggy')
  const [selectedReportNo, setSelectedReportNo] = useState<number | undefined>()
  const [showArchive, setShowArchive] = useState(false)
  const prevPlatformRef = useRef<Platform>('swiggy')

  const restaurantId = user?.type === 'restaurant' ? user.id : ''
  const restaurantName = user?.type === 'restaurant' ? user.name : ''

  const { platforms, loading: dataLoading } = useReport(restaurantId, selectedReportNo)
  const { reports: reportList } = useReportList(restaurantId)

  const platData = platforms[platform]
  const report = platData?.report ?? null
  const payout = platData?.payout ?? []
  const performance = platData?.performance ?? []
  const topItems = platData?.topItems ?? []
  const ledger = platData?.ledger ?? []

  const color = PLATFORM_COLOR[platform]
  const dataLoaded = !dataLoading

  const availablePlatforms = Object.keys(platforms) as Platform[]
  const hasPlatform = availablePlatforms.includes(platform)

  const direction = PLATFORM_ORDER.indexOf(platform) > PLATFORM_ORDER.indexOf(prevPlatformRef.current) ? 1 : -1

  const currentReportNo = report?.report_no

  function switchPlatform(p: Platform) {
    prevPlatformRef.current = platform
    setPlatform(p)
  }

  function selectReport(reportNo: number) {
    setSelectedReportNo(reportNo)
    setShowArchive(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...TEXTURE }}>

      {/* Loader overlay */}
      <AnimatePresence>
        {showLoader && <Loader onDone={() => setShowLoader(false)} />}
      </AnimatePresence>

      {/* Report Archive Modal */}
      <AnimatePresence>
        {showArchive && (
          <ReportArchiveModal
            reports={reportList}
            currentReportNo={currentReportNo}
            onSelect={selectReport}
            onClose={() => setShowArchive(false)}
          />
        )}
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

      {/* Restaurant name + platform switcher + archive button */}
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

        {/* Platform tabs + Archive icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <motion.div
            animate={{ background: platform === 'swiggy' ? '#fff4ec' : '#fff0f1' }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', gap: 4, borderRadius: 16, padding: '4px', border: `1.5px solid ${PLATFORM_COLOR[platform]}33` }}
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

          {/* Archive button */}
          {reportList.length > 1 && (
            <motion.button
              onClick={() => setShowArchive(true)}
              whileHover={{ scale: 1.08, background: '#f1f5f9' }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 42, height: 42, borderRadius: 14,
                border: '1.5px solid #e2e8f0', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}
              title="Report Archive"
            >
              <Archive size={18} color="#64748b" />
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: '#0f172a', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>
                {reportList.length}
              </span>
            </motion.button>
          )}
        </div>
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

          {/* No report for this platform */}
          {!showLoader && dataLoaded && !hasPlatform && (
            <motion.div key="no-report"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '100px 20px' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                <AlertCircle size={28} color="#94a3b8" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: '0 0 8px' }}>
                No {platform === 'swiggy' ? 'Swiggy' : 'Zomato'} data{currentReportNo ? ` in ${formatReportNo(currentReportNo)}` : ''}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>
                {availablePlatforms.length > 0
                  ? `This report only has ${availablePlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' and ')} data.`
                  : 'No report has been uploaded yet.'}
              </p>
            </motion.div>
          )}

          {/* Dashboard */}
          {!showLoader && dataLoaded && report && hasPlatform && (
            <motion.div
              key={`${restaurantId}-${platform}-${report.report_no}`}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 36 }}
            >
              {/* Report info pill */}
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
                    {platform === 'swiggy' ? 'Swiggy' : 'Zomato'}
                  </span>
                  <span style={{ color: `${color}66` }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: platform === 'swiggy' ? '#7c2d12' : '#9f1239' }}>
                    {formatReportNo(report.report_no)}
                  </span>
                  <span style={{ color: `${color}66` }}>·</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: platform === 'swiggy' ? '#9a3412' : '#881337' }}>
                    {formatDateRange(report.period_start_date, report.period_end_date)}
                  </span>
                </div>

                {report.is_full_month && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#059669',
                    background: '#ecfdf5', border: '1px solid #a7f3d0',
                    borderRadius: 999, padding: '3px 10px',
                  }}>
                    Full month
                  </span>
                )}
              </motion.div>

              <PayoutBreakdown periods={payout} accentColor={color} platform={platform} />

              <PerformanceOverview periods={performance} accentColor={color} platform={platform} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CardExpander
                  title="Top 5 Items"
                  description="Your five best-selling menu items ranked by units sold. Bar width shows each item's share relative to the top seller."
                  accentColor={color}
                >
                  <TopItems items={topItems} accentColor={color} />
                </CardExpander>

                <CardExpander
                  title="Unique Items Sold"
                  description="How many distinct menu items got at least one order during this period."
                  accentColor={color}
                >
                  <UniqueItems
                    count={ledger.length}
                    startDate={report.period_start_date}
                    endDate={report.period_end_date}
                  />
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
