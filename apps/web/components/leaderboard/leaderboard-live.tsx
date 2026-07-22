"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEventStream, useLeaderboardQuery } from "@/hooks/use-event-stream";
import { LeaderboardTable } from "./leaderboard-table";
import { Podium } from "./podium";
import type { Event, LeaderboardEntry } from "@estimathon/types";

interface LeaderboardLiveProps {
  event: Event;
  initialLeaderboard: LeaderboardEntry[];
  accessToken: string | null;
  highlightTeamId?: string | null;
}

export function LeaderboardLive({
  event,
  initialLeaderboard,
  accessToken,
  highlightTeamId,
}: LeaderboardLiveProps) {
  const router = useRouter();

  const onEventStatus = useCallback(
    (msg: { status: Event["status"] }) => {
      if (msg.status === "ended" || msg.status === "archived") {
        router.push("/results");
      }
    },
    [router]
  );

  useEventStream({
    eventId: accessToken ? event.id : null,
    accessToken,
    onEventStatus,
  });

  const { data: leaderboard } = useLeaderboardQuery(event.id, initialLeaderboard);

  return (
    <div className="grid gap-8">
      <Podium entries={leaderboard} highlightTeamId={highlightTeamId} />
      <LeaderboardTable entries={leaderboard} highlightTeamId={highlightTeamId} />
    </div>
  );
}
