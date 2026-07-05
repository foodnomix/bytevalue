import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

export default function AnimatedNumber({ value, format, duration = 900, className }: Props) {
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
      setDisplay(startRef.current + (value - startRef.current) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const str = format ? format(display) : display.toFixed(0)
  return <span className={className}>{str}</span>
}
