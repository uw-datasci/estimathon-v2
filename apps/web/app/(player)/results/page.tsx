import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@estimathon/ui/components/button"
import { LeaderboardLive } from "@/components/leaderboard/leaderboard-live"
import { proxyApiJson } from "@/lib/api/proxy"
import { getAccessToken } from "@/lib/auth/session"
import type { LeaderboardEntry, MeResponse } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function ResultsPage() {
  const me = await proxyApiJson<MeResponse>("/me")
  if (me.status === 401 || !me.data) redirect("/")

  const { event, team } = me.data
  if (!event) redirect("/")
  if (event.status === "active") redirect("/play")
  if (event.status !== "ended") redirect("/")

  const leaderboardResult = await proxyApiJson<{ leaderboard: LeaderboardEntry[] }>(
    `/events/${encodeURIComponent(event.id)}/leaderboard`
  )
  const accessToken = await getAccessToken()

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          {event.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Final results
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Thanks for playing Estimathon.
        </p>
      </div>
      <LeaderboardLive
        event={event}
        initialLeaderboard={leaderboardResult.data?.leaderboard ?? []}
        accessToken={accessToken}
        highlightTeamId={team?.id ?? null}
      />
      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  )
}
