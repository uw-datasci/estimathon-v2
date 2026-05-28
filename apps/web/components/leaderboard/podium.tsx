"use client"

import { motion, useReducedMotion } from "motion/react"
import { Card, CardContent } from "@estimathon/ui/components/card"
import { ScoreCounter } from "@/components/play/score-counter"
import type { LeaderboardEntry } from "@estimathon/types"
import { cn } from "@estimathon/ui/lib/utils"

interface PodiumProps {
  entries: LeaderboardEntry[]
  highlightTeamId?: string | null
}

const ORDER = [1, 0, 2] as const

export function Podium({ entries, highlightTeamId }: PodiumProps) {
  const prefersReduced = useReducedMotion()
  const top = entries.slice(0, 3)
  if (top.length === 0) return null

  const heights = ["h-28", "h-36", "h-24"]

  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {ORDER.map((slot, displayIndex) => {
        const entry = top[slot]
        if (!entry) {
          return <div key={`empty-${displayIndex}`} />
        }
        const place = slot + 1
        return (
          <motion.div
            key={entry.teamId}
            layout={!prefersReduced}
            className={cn("flex flex-col items-center gap-2")}
          >
            <Card
              className={cn(
                "w-full",
                highlightTeamId === entry.teamId && "ring-primary ring-2"
              )}
            >
              <CardContent className="p-3 text-center">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
                  #{place}
                </p>
                <p className="truncate text-sm font-semibold">
                  {entry.name ?? entry.code}
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  <ScoreCounter value={entry.score} />
                </p>
              </CardContent>
            </Card>
            <div
              className={cn(
                "bg-muted w-full rounded-t-md",
                heights[displayIndex]
              )}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
