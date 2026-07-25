"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  target: string;
  /** Called once when the countdown reaches zero. */
  onComplete?: () => void;
  /** Use light text - for rendering directly on the blue backdrop instead of a card. */
  light?: boolean;
}

function format(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ target, onComplete, light = false }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => {
    const ms = Date.parse(target) - Date.now();
    return Number.isFinite(ms) ? ms : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = Date.parse(target) - Date.now();
      setRemaining(ms);
      if (ms <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [target, onComplete]);

  const { d, h, m, s } = format(remaining);
  const showDays = d > 0;
  const mutedClass = light ? "text-portage-100" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 tabular-nums" aria-label="Time remaining">
      {showDays && <Segment value={d} label="days" />}
      <Segment value={h} label="hr" padded />
      <span className={mutedClass}>:</span>
      <Segment value={m} label="min" padded />
      <span className={mutedClass}>:</span>
      <Segment value={s} label="sec" padded />
    </div>
  );

  function Segment({
    value,
    label,
    padded = false,
  }: {
    value: number;
    label: string;
    padded?: boolean;
  }) {
    return (
      <div className="flex flex-col items-center">
        <span className={`text-3xl font-semibold sm:text-4xl ${light ? "text-white" : ""}`}>
          {padded ? pad(value) : value}
        </span>
        <span className={`text-[10px] tracking-widest uppercase ${mutedClass}`}>{label}</span>
      </div>
    );
  }
}
