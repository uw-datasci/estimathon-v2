import { redirect } from "next/navigation";
import Link from "next/link";
import { proxyApiJson } from "@/lib/api/proxy";
import { TeamOnboarding } from "@/components/team/team-onboarding";
import type { MeResponse } from "@estimathon/types";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const me = await proxyApiJson<MeResponse>("/me");

  // Player layout already requires a session, so /me should always succeed.
  // If somehow it doesn't, redirect back to login.
  if (me.status === 401 || !me.data) redirect("/");

  const { event, team } = me.data;

  if (!event) {
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">No active event</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back when the next estimathon opens.
        </p>
        <Link href="/" className="mt-6 text-sm text-primary hover:underline">
          ← Back to landing
        </Link>
      </main>
    );
  }

  // Already on a team - skip onboarding.
  if (team) redirect("/play");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{event.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Set up your team</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new team and share the code, or join one with a code a teammate gave you.
        </p>
      </div>
      <TeamOnboarding eventId={event.id} />
    </main>
  );
}
