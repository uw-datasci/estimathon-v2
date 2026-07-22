import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@estimathon/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@estimathon/ui/components/table";
import { AdminShell } from "@/components/admin/admin-shell";
import { proxyApiJson } from "@/lib/api/proxy";
import type { Event, Team, TeamScore } from "@estimathon/types";

export const dynamic = "force-dynamic";

interface AdminTeamRow {
  team: Team;
  members: Array<{ userId: string; joinedAt: string }>;
  score: TeamScore;
}

export default async function AdminTeamsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [eventResult, teamsResult] = await Promise.all([
    proxyApiJson<Event>(`/events/${encodeURIComponent(eventId)}`),
    proxyApiJson<{ teams: AdminTeamRow[] }>(
      `/admin/events/${encodeURIComponent(eventId)}/teams`
    ),
  ]);
  if (eventResult.status === 404 || !eventResult.data) notFound();
  const teams = teamsResult.data?.teams ?? [];

  return (
    <AdminShell
      title="Teams"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/events/${eventId}`}>← Event</Link>
        </Button>
      }
    >
      <p className="mb-6 text-sm text-muted-foreground">
        {eventResult.data.name} - {teams.length} team
        {teams.length === 1 ? "" : "s"}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Members</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Guesses</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No teams yet.
              </TableCell>
            </TableRow>
          ) : (
            teams.map(({ team, members, score }) => (
              <TableRow key={team.id}>
                <TableCell className="font-mono">{team.code}</TableCell>
                <TableCell>{team.name ?? "-"}</TableCell>
                <TableCell className="text-right tabular-nums">{members.length}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {score.score}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {score.submissionCount}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminShell>
  );
}
