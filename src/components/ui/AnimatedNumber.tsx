import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

export default function AnimatedNumber({ value, format, duration = 900, className }: Props) {
  const safeValue = (value ?? 0) || 0
  const [display, setDisplay] = useState(0)
  const startRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = display
    startTimeRef.current = null

    function step(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const next = startRef.current + (safeValue - startRef.current) * eased
      setDisplay(Number.isFinite(next) ? next : 0)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [safeValue, duration])

  const str = format ? format(display) : display.toFixed(0)
  return <span className={className}>{str}</span>
}
