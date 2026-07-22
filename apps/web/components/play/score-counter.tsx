"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

interface ScoreCounterProps {
  value: number;
  className?: string;
}

/**
 * Animated number that smoothly rolls to its new value. Respects
 * prefers-reduced-motion (jumps to the target instantly).
 */
export function ScoreCounter({ value, className }: ScoreCounterProps) {
  const prefersReduced = useReducedMotion();
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 90,
    mass: 0.8,
  });
  const display = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (prefersReduced) {
      motionValue.jump(value);
    } else {
      motionValue.set(value);
    }
  }, [value, motionValue, prefersReduced]);

  return <motion.span className={className}>{display}</motion.span>;
}
