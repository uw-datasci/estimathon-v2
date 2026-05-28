"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@estimathon/ui/lib/utils"

interface TimerProps {
  endsAt: string
  onExpire?: () => void
}

const pad = (n: number) => String(n).padStart(2, "0")

function formatRemaining(ms: number) {
  if (ms <= 0) return { totalSec: 0, h: 0, m: 0, s: 0 }
  const totalSec = Math.floor(ms / 1000)
  return {
    totalSec,
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}

/**
 * Countdown to the event's end. Pulse animation that intensifies as time
 * runs out:
 *   > 5 min - no pulse
 *   1–5 min - gentle pulse, 2s cycle
 *   < 1 min - sharper pulse, 0.6s cycle
 *
 * Tone shifts via Tailwind colors at the same thresholds.
 */
export function Timer({ endsAt, onExpire }: TimerProps) {
  const prefersReduced = useReducedMotion()
  const [remaining, setRemaining] = useState(() =>
    formatRemaining(Date.parse(endsAt) - Date.now())
  )

  useEffect(() => {
    const tick = () => {
      const r = formatRemaining(Date.parse(endsAt) - Date.now())
      setRemaining(r)
      if (r.totalSec <= 0) onExpire?.()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  const urgency =
    remaining.totalSec <= 60
      ? "critical"
      : remaining.totalSec <= 300
        ? "warning"
        : "normal"

  const pulseAnimation = prefersReduced
    ? undefined
    : urgency === "critical"
      ? {
          scale: [1, 1.06, 1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : urgency === "warning"
        ? {
            scale: [1, 1.03, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" as const,
            },
          }
        : undefined

  const colorClass =
    urgency === "critical"
      ? "text-destructive"
      : urgency === "warning"
        ? "text-amber-600 dark:text-amber-500"
        : "text-foreground"

  return (
    <motion.div
      animate={pulseAnimation}
      className={cn(
        "flex items-baseline gap-1 font-mono text-2xl tabular-nums sm:text-3xl",
        colorClass
      )}
      aria-label="Time remaining"
    >
      {remaining.h > 0 && (
        <>
          <span>{pad(remaining.h)}</span>
          <span className="text-muted-foreground">:</span>
        </>
      )}
      <span>{pad(remaining.m)}</span>
      <span className="text-muted-foreground">:</span>
      <span>{pad(remaining.s)}</span>
    </motion.div>
  )
}
