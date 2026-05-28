"use client"

import { useCallback, useState } from "react"
import {
  useEventStream,
  useLeaderboardQuery,
} from "@/hooks/use-event-stream"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import type { LeaderboardEntry, ServerMessage } from "@estimathon/types"
import { ScrollArea } from "@estimathon/ui/components/scroll-area"

interface FeedItem {
  id: string
  teamCode: string
  teamName: string | null
  minValue: number
  maxValue: number
  submittedAt: string
}

interface LiveMonitorProps {
  eventId: string
  accessToken: string | null
  initialLeaderboard: LeaderboardEntry[]
}

export function LiveMonitor({
  eventId,
  accessToken,
  initialLeaderboard,
}: LiveMonitorProps) {
  const [feed, setFeed] = useState<FeedItem[]>([])

  const onSubmission = useCallback(
    (msg: ServerMessage & { type: "submission" }) => {
      setFeed((prev) => [
        {
          id: `${msg.submission.id}-${msg.submission.submittedAt}`,
          teamCode: msg.teamCode,
          teamName: msg.teamName,
          minValue: msg.submission.minValue,
          maxValue: msg.submission.maxValue,
          submittedAt: msg.submission.submittedAt,
        },
        ...prev.slice(0, 49),
      ])
    },
    []
  )

  useEventStream({
    eventId: accessToken ? eventId : null,
    accessToken,
    onSubmission,
  })

  const { data: leaderboard } = useLeaderboardQuery(eventId, initialLeaderboard)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Live submissions</h2>
        <ScrollArea className="h-[min(24rem,50vh)] rounded-lg border">
          {feed.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              Waiting for submissions…
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {feed.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">
                      {item.teamName ?? item.teamCode}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {new Date(item.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    [{item.minValue}, {item.maxValue}]
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </section>
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Leaderboard</h2>
        <LeaderboardTable entries={leaderboard} />
      </section>
    </div>
  )
}
