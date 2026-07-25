import { redirect } from "next/navigation";
import { proxyApiJson } from "@/lib/api/proxy";
import { getAccessToken, getSessionIdentity } from "@/lib/auth/session";
import { hasEventStarted } from "@/lib/event/helpers";
import { PlayClient } from "@/components/play/play-client";
import type {
  LeaderboardEntry,
  MeResponse,
  Question,
  Submission,
  TeamScore,
} from "@estimathon/types";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const me = await proxyApiJson<MeResponse>("/me");
  if (me.status === 401 || !me.data) redirect("/");

  const { event, team } = me.data;
  if (!event) redirect("/");
  if (!team) redirect("/onboarding");
  if (event.status !== "active") redirect("/results");
  if (!hasEventStarted(event.startsAt)) redirect("/waiting");

  const [questionsResult, submissionsResult, scoreResult, leaderboardResult] =
    await Promise.all([
      proxyApiJson<{ questions: Question[] }>(
        `/events/${encodeURIComponent(event.id)}/questions`
      ),
      proxyApiJson<{ submissions: Submission[] }>(
        `/teams/${encodeURIComponent(team.id)}/submissions`
      ),
      proxyApiJson<TeamScore>(`/teams/${encodeURIComponent(team.id)}/score`),
      proxyApiJson<{ leaderboard: LeaderboardEntry[] }>(
        `/events/${encodeURIComponent(event.id)}/leaderboard`
      ),
    ]);

  const [accessToken, currentUser] = await Promise.all([
    getAccessToken(),
    getSessionIdentity(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <PlayClient
          event={event}
          team={team}
          questions={questionsResult.data?.questions ?? []}
          initialSubmissions={submissionsResult.data?.submissions ?? []}
          initialScore={
            scoreResult.data ?? {
              teamId: team.id,
              score: 0,
              goodIntervals: 0,
              submissionCount: 0,
              evaluations: [],
            }
          }
          initialLeaderboard={leaderboardResult.data?.leaderboard ?? []}
          accessToken={accessToken}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
