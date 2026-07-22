"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@estimathon/ui/lib/utils";

interface TimerProps {
  endsAt: string;
  /** When set, the timer is frozen at `endsAt - pausedAt` and won't expire. */
  pausedAt?: string | null;
  onExpire?: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatRemaining(ms: number) {
  if (ms <= 0) return { totalSec: 0, h: 0, m: 0, s: 0 };
  const totalSec = Math.floor(ms / 1000);
  return {
    totalSec,
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  };
}

/** Remaining ms to `endsAt`, frozen at `endsAt - pausedAt` while paused. */
function remainingMs(endsAt: string, pausedAt: string | null | undefined) {
  return Date.parse(endsAt) - (pausedAt ? Date.parse(pausedAt) : Date.now());
}

/**
 * Countdown to the event's end. Pulse animation that intensifies as time
 * runs out:
 *   > 5 min - no pulse
 *   1–5 min - gentle pulse, 2s cycle
 *   < 1 min - sharper pulse, 0.6s cycle
 *
 * Tone shifts via Tailwind colors at the same thresholds. While `pausedAt`
 * is set, the display freezes at the remaining time and doesn't fire
 * `onExpire`.
 */
export function Timer({ endsAt, pausedAt, onExpire }: TimerProps) {
  const prefersReduced = useReducedMotion();
  const [tickingRemaining, setTickingRemaining] = useState(() =>
    formatRemaining(remainingMs(endsAt, pausedAt))
  );

  useEffect(() => {
    if (pausedAt) return;
    const tick = () => {
      const r = formatRemaining(remainingMs(endsAt, pausedAt));
      setTickingRemaining(r);
      if (r.totalSec <= 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, pausedAt, onExpire]);

  // While paused the display is a pure function of props - no ticking
  // interval, so it's derived directly instead of round-tripping state.
  const remaining = pausedAt
    ? formatRemaining(remainingMs(endsAt, pausedAt))
    : tickingRemaining;

  const urgency =
    remaining.totalSec <= 60 ? "critical" : remaining.totalSec <= 300 ? "warning" : "normal";

  const pulseAnimation =
    prefersReduced || pausedAt
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
          : undefined;

  const colorClass =
    urgency === "critical"
      ? "text-destructive"
      : urgency === "warning"
        ? "text-amber-600 dark:text-amber-500"
        : "text-foreground";

  return (
    <div className="flex items-baseline gap-2">
      <motion.div
        animate={pulseAnimation}
        className={cn(
          "flex items-baseline gap-1 font-mono text-2xl tabular-nums sm:text-3xl",
          colorClass
        )}
        aria-label={pausedAt ? "Time remaining (paused)" : "Time remaining"}
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
      {pausedAt && (
        <span className="text-xs tracking-widest text-muted-foreground uppercase">Paused</span>
      )}
    </div>
  );
}
