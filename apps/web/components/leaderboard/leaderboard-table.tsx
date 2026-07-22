"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@estimathon/ui/components/table";

const MotionTableRow = motion(TableRow);
import { ScoreCounter } from "@/components/play/score-counter";
import type { LeaderboardEntry } from "@estimathon/types";
import { cn } from "@estimathon/ui/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightTeamId?: string | null;
  className?: string;
}

export function LeaderboardTable({
  entries,
  highlightTeamId,
  className,
}: LeaderboardTableProps) {
  const prefersReduced = useReducedMotion();

  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No teams yet.
      </p>
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Intervals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence mode="popLayout" initial={false}>
          {entries.map((entry, index) => (
            <MotionTableRow
              key={entry.teamId}
              layout={!prefersReduced}
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0 }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { type: "spring", damping: 22, stiffness: 280 }
              }
              className={cn(highlightTeamId === entry.teamId && "bg-muted/50")}
            >
              <TableCell className="font-mono text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="font-medium">{entry.name ?? `Team ${entry.code}`}</div>
                <div className="font-mono text-xs text-muted-foreground">{entry.code}</div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <ScoreCounter value={entry.score} />
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {entry.goodIntervals}
              </TableCell>
            </MotionTableRow>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}
