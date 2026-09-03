import { useEffect, useRef, useState } from 'react'

const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Animate a number from 0 → target once, on mount. Returns the current value. */
export function useCountUp(target: number, durationMs = 650): number {
  const [value, setValue] = useState(reduced ? target : 0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }
    let raf = 0
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const t = Math.min(1, (now - startRef.current) / durationMs)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}
