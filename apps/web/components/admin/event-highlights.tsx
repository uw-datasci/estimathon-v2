"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@estimathon/ui/components/card";
import { StatTile } from "@/components/shared/stat-tile";
import { ScoreCounter } from "@/components/play/score-counter";
import { useEventStream, useLeaderboardQuery } from "@/hooks/use-event-stream";
import type { Event, EventStats, LeaderboardEntry, ServerMessage } from "@estimathon/types";

interface EventHighlightsProps {
  eventId: string;
  eventStatus: Event["status"];
  accessToken: string | null;
  initialStats: EventStats;
  initialLeaderboard: LeaderboardEntry[];
}

export function EventHighlights({
  eventId,
  eventStatus,
  accessToken,
  initialStats,
  initialLeaderboard,
}: EventHighlightsProps) {
  const [stats, setStats] = useState<EventStats>(initialStats);

  const onEventStats = useCallback((msg: ServerMessage & { type: "event_stats" }) => {
    setStats(msg.data);
  }, []);

  useEventStream({
    eventId: accessToken ? eventId : null,
    accessToken,
    onEventStats,
  });

  const { data: leaderboard } = useLeaderboardQuery(eventId, initialLeaderboard);
  const leader = leaderboard[0];

  if (eventStatus === "draft") {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Highlights go live once the event starts.
        </CardContent>
      </Card>
    );
  }

  const avgAnswered = Math.round(stats.avgAnswered * 10) / 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Players joined"
            value={
              <span className="font-semibold">
                <ScoreCounter value={stats.playerCount} />
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({stats.teamCount} team{stats.teamCount === 1 ? "" : "s"})
                </span>
              </span>
            }
          />
          <StatTile
            label="Avg progress"
            value={
              <span className="font-semibold tabular-nums">
                {avgAnswered}/{stats.questionCount}
              </span>
            }
          />
          <StatTile
            label="Finished"
            value={
              <span className="font-semibold tabular-nums">
                {stats.finishedCount}/{stats.teamCount}
              </span>
            }
          />
          <StatTile
            label="Current leader"
            value={
              leader ? (
                <span className="font-semibold">
                  {leader.name ?? leader.code}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    · {leader.score}
                  </span>
                </span>
              ) : (
                <span className="font-semibold text-muted-foreground">—</span>
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
