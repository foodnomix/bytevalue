import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface HelpItem {
  label: string
  text: string
  value?: string
}

interface Props {
  children: ReactNode
  title: string
  description: string
  accentColor: string
  helpItems?: HelpItem[]
  mainValue?: string
}

export default function CardExpander({ children, title, description, accentColor, helpItems, mainValue }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })

  function handleOpen() {
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect()
      setOrigin({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
      })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
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
  }, [open])

  return (
    <>
      <motion.div
        ref={wrapRef}
        onClick={handleOpen}
        whileHover={{ scale: 1.008 }}
        whileTap={{ scale: 0.997 }}
        transition={{ duration: 0.15 }}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 50,
                background: 'rgba(11,17,32,0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            />

            <div style={{
              position: 'fixed', inset: 0, zIndex: 51,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 0.5, 0], scale: [0.3, 1.8, 2.5] }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: 250, height: 250,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${accentColor}35, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.06,
                  x: origin.x,
                  y: origin.y,
                  rotate: -8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.06,
                  x: origin.x,
                  y: origin.y,
                  rotate: 8,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 26,
                  mass: 0.6,
                }}
                style={{
                  pointerEvents: 'auto',
                  width: 'min(92vw, 540px)',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  background: '#fff',
                  borderRadius: 24,
                  boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 60px ${accentColor}18`,
                }}
                className="scrollbar-thin"
              >
                <div style={{
                  position: 'sticky', top: 0, zIndex: 5,
                  background: '#fff',
                  borderRadius: '24px 24px 0 0',
                }}>
                  <div style={{
                    height: 3,
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66, transparent)`,
                    borderRadius: '24px 24px 0 0',
                  }} />

                  <div style={{
                    padding: '18px 20px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 17, fontWeight: 900, color: '#0f172a',
                        margin: '0 0 6px',
                      }}>{title}</h3>

                      {mainValue && (
                        <p style={{
                          fontSize: 28, fontWeight: 900, color: accentColor,
                          margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1,
                        }}>{mainValue}</p>
                      )}

                      <p style={{
                        fontSize: 12.5, fontWeight: 500, color: '#64748b',
                        margin: 0, lineHeight: 1.65,
                      }}>{description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.12, background: '#fee2e2' }}
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                      style={{
                        width: 30, height: 30, borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <X size={14} color="#64748b" />
                    </motion.button>
                  </div>
                </div>

                {helpItems && helpItems.length > 0 && (
                  <div style={{ padding: '4px 20px 24px' }}>
                    {helpItems.map((item, i) => (
                      <div key={i} style={{
                        padding: '12px 0',
                        borderBottom: i < helpItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <p style={{
                            fontSize: 11, fontWeight: 800, color: accentColor,
                            margin: 0, letterSpacing: '0.04em',
                          }}>{item.label}</p>
                          {item.value && (
                            <span style={{
                              fontSize: 14, fontWeight: 900, color: '#0f172a',
                              flexShrink: 0,
                            }}>{item.value}</span>
                          )}
                        </div>
                        <p style={{
                          fontSize: 12, fontWeight: 500, color: '#475569',
                          margin: '4px 0 0', lineHeight: 1.65,
                        }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
