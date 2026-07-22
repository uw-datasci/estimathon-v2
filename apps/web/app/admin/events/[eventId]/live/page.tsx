import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@estimathon/ui/components/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveMonitor } from "@/components/admin/live-monitor";
import { proxyApiJson } from "@/lib/api/proxy";
import { getAccessToken } from "@/lib/auth/session";
import type { Event, LeaderboardEntry } from "@estimathon/types";

export const dynamic = "force-dynamic";

export default async function AdminLivePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [eventResult, leaderboardResult] = await Promise.all([
    proxyApiJson<Event>(`/events/${encodeURIComponent(eventId)}`),
    proxyApiJson<{ leaderboard: LeaderboardEntry[] }>(
      `/events/${encodeURIComponent(eventId)}/leaderboard`
    ),
  ]);
  if (eventResult.status === 404 || !eventResult.data) notFound();
  const accessToken = await getAccessToken();

  return (
    <AdminShell
      title="Live monitor"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/events/${eventId}`}>← Event</Link>
        </Button>
      }
    >
      <p className="mb-6 text-sm text-muted-foreground">
        {eventResult.data.name} - submissions and standings update in real time.
      </p>
      <LiveMonitor
        eventId={eventId}
        accessToken={accessToken}
        initialLeaderboard={leaderboardResult.data?.leaderboard ?? []}
      />
    </AdminShell>
  );
}
