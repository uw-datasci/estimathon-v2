"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Countdown } from "@/components/shared/countdown";
import { useEventStream } from "@/hooks/use-event-stream";
import { Card, CardContent, CardHeader, CardTitle } from "@estimathon/ui/components/card";
import type { Event, ServerMessage, Team } from "@estimathon/types";

interface Props {
  event: Event;
  team: Team;
  accessToken: string | null;
}

export function WaitingScreen({ event, team, accessToken }: Readonly<Props>) {
  const router = useRouter();

  const onEventStatus = useCallback(
    (msg: ServerMessage & { type: "event_status" }) => {
      if (msg.status === "ended" || msg.status === "archived") {
        toast.info("Event ended");
        router.replace("/results");
      }
    },
    [router]
  );

  useEventStream({
    eventId: accessToken ? event.id : null,
    accessToken,
    onEventStatus,
  });

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 text-center">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">{event.name}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Event starts in</h1>
      {event.startsAt && (
        <div className="mt-8 flex justify-center">
          <Countdown target={event.startsAt} onComplete={() => router.replace("/play")} />
        </div>
      )}
      <Card className="mt-10 text-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your team</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {team.name && <p className="font-medium">{team.name}</p>}
          <p className="text-xs text-muted-foreground">
            Code <span className="font-mono">{team.code}</span> - share with teammates
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
