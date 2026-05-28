"use client"

import { useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Lock, Send } from "lucide-react"
import { Button } from "@estimathon/ui/components/button"
import { Input } from "@estimathon/ui/components/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"
import type { Question, Submission } from "@estimathon/types"
import { cn } from "@estimathon/ui/lib/utils"

interface QuestionCardProps {
  question: Question
  latest: Submission | null
  onSubmit: (min: number, max: number) => Promise<void>
  disabled?: boolean
}

export function QuestionCard({
  question,
  latest,
  onSubmit,
  disabled,
}: Readonly<QuestionCardProps>) {
  const prefersReduced = useReducedMotion()
  const latestSyncKey = latest
    ? `${latest.id}:${latest.minValue}:${latest.maxValue}`
    : ""
  const [min, setMin] = useState(latest ? String(latest.minValue) : "")
  const [max, setMax] = useState(latest ? String(latest.maxValue) : "")
  const [prevLatestSyncKey, setPrevLatestSyncKey] = useState(latestSyncKey)
  const [submitting, setSubmitting] = useState(false)
  const justLockedRef = useRef(0)
  const [pulseToken, setPulseToken] = useState(0)

  // Reflect server updates (e.g. teammate submitted) back into the inputs.
  if (latestSyncKey !== prevLatestSyncKey) {
    setPrevLatestSyncKey(latestSyncKey)
    setMin(latest ? String(latest.minValue) : "")
    setMax(latest ? String(latest.maxValue) : "")
  }

  async function handleSubmit() {
    const minNum = Number(min)
    const maxNum = Number(max)
    if (
      !Number.isFinite(minNum) ||
      !Number.isFinite(maxNum) ||
      minNum <= 0 ||
      maxNum < minNum
    )
      return
    setSubmitting(true)
    try {
      await onSubmit(minNum, maxNum)
      justLockedRef.current = Date.now()
      setPulseToken((t) => t + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const locked = !!latest
  const settleAnimation = prefersReduced
    ? undefined
    : {
        scale: [1, 1.02, 1],
        transition: { duration: 0.4, ease: "easeOut" as const },
      }

  return (
    <motion.div
      key={pulseToken}
      animate={pulseToken > 0 ? settleAnimation : undefined}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-colors",
          locked && "border-primary/50"
        )}
      >
        <motion.div
          key={`ring-${pulseToken}`}
          initial={{ opacity: pulseToken > 0 && !prefersReduced ? 1 : 0 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary/40 ring-offset-2"
          aria-hidden
        />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
            <span>
              <span className="text-muted-foreground">
                #{question.position}
              </span>{" "}
              <span className="text-foreground">{question.prompt}</span>
            </span>
            {locked && (
              <Lock
                className="text-primary"
                size={14}
                aria-label="Range submitted"
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="min"
              value={min}
              min={0}
              onChange={(e) => setMin(e.target.value)}
              disabled={disabled || submitting}
              className="text-right tabular-nums"
              inputMode="decimal"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="max"
              value={max}
              min={0}
              onChange={(e) => setMax(e.target.value)}
              disabled={disabled || submitting}
              className="text-right tabular-nums"
              inputMode="decimal"
            />
            <Button
              size="icon-sm"
              onClick={handleSubmit}
              disabled={disabled || submitting || !min || !max}
              aria-label="Submit"
            >
              <Send />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
