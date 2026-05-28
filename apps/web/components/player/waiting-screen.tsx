"use client"

import { useRouter } from "next/navigation"
import { Countdown } from "@/components/shared/countdown"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"
import type { Event, Team } from "@estimathon/types"

interface Props {
  event: Event
  team: Team
}

export function WaitingScreen({ event, team }: Readonly<Props>) {
  const router = useRouter()

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 text-center">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">
        {event.name}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Event starts in
      </h1>
      <div className="mt-8 flex justify-center">
        <Countdown
          target={event.startsAt}
          onComplete={() => router.replace("/play")}
        />
      </div>
      <Card className="mt-10 text-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your team</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {team.name && <p className="font-medium">{team.name}</p>}
          <p className="text-xs text-muted-foreground">
            Code <span className="font-mono">{team.code}</span> - share with
            teammates
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
