"use client"

import Link from "next/link"
import { Button } from "@estimathon/ui/components/button"
import { Countdown } from "@/components/shared/countdown"
import type { Event } from "@estimathon/types"

interface LandingHeroProps {
  event: Event | null
  isLoggedIn: boolean
  loginHref: string
}

export function LandingHero({
  event,
  isLoggedIn,
  loginHref,
}: Readonly<LandingHeroProps>) {
  const isActive = event?.status === "active"

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        UW Data Science Club
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Estimathon
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Teams submit numeric ranges for estimation questions. Golf scoring -
        lower is better. Correct intervals tighten your multiplier; wrong ones
        blow it up.
      </p>

      {isActive && event ? (
        <div className="mt-10 rounded-xl border bg-card p-6">
          <p className="text-sm font-medium">{event.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Event in progress - ends in
          </p>
          <div className="mt-6 flex justify-center">
            <Countdown target={event.endsAt} />
          </div>
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No event running right now. Check back next season.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {isLoggedIn ? (
          <>
            <Button asChild>
              <Link href="/play">Enter event</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
          </>
        ) : (
          <Button asChild>
            <a href={loginHref}>Log in with club account</a>
          </Button>
        )}
      </div>
    </div>
  )
}
