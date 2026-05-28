import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@estimathon/ui/components/button"
import { LeaderboardLive } from "@/components/leaderboard/leaderboard-live"
import { proxyApiJson } from "@/lib/api/proxy"
import { getAccessToken } from "@/lib/auth/session"
import type { LeaderboardEntry, MeResponse } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const me = await proxyApiJson<MeResponse>("/me")
  if (me.status === 401 || !me.data) redirect("/")

  const { event, team } = me.data
  if (!event) redirect("/")

  const leaderboardResult = await proxyApiJson<{ leaderboard: LeaderboardEntry[] }>(
    `/events/${encodeURIComponent(event.id)}/leaderboard`
  )
  const accessToken = await getAccessToken()

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
            {event.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lower score is better. Updates live during the event.
          </p>
        </div>
        {event.status === "active" && (
          <Button asChild variant="outline" size="sm">
            <Link href="/play">Back to game</Link>
          </Button>
        )}
      </div>
      <LeaderboardLive
        event={event}
        initialLeaderboard={leaderboardResult.data?.leaderboard ?? []}
        accessToken={accessToken}
        highlightTeamId={team?.id ?? null}
      />
    </main>
  )
}
