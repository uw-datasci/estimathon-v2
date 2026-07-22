"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@estimathon/ui/components/button";
import { Input } from "@estimathon/ui/components/input";
import { Label } from "@estimathon/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card";
import type { Team } from "@estimathon/types";

interface TeamOnboardingProps {
  readonly eventId: string;
}

export function TeamOnboarding({ eventId }: TeamOnboardingProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch(`/api/events/${eventId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim() || null }),
      });
      const data = (await res.json()) as Team | { error?: string };
      if (!res.ok) throw new Error(("error" in data && data.error) || "Failed");
      const team = data as Team;
      toast.success(`Team created - code ${team.code}`);
      router.push("/play");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim();
    if (!/^\d{5}$/.test(code)) {
      toast.error("Code is 5 digits");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/events/${eventId}/teams/${code}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Joined team");
      router.push("/play");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a team</CardTitle>
          <CardDescription>
            You&apos;ll get a 5-digit code to share with teammates.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="team-name">
              Team name <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="team-name"
              placeholder="Bayes of Glory"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={64}
            />
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating…" : "Create team"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Join a team</CardTitle>
          <CardDescription>Enter the code your teammate shared.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="team-code">Team code</Label>
            <Input
              id="team-code"
              placeholder="12345"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              maxLength={5}
              className="tracking-[0.4em] tabular-nums"
            />
          </div>
          <Button onClick={handleJoin} disabled={joining || joinCode.length !== 5}>
            {joining ? "Joining…" : "Join"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
