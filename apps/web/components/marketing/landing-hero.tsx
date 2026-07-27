"use client";

import Link from "next/link";
import { Button } from "@estimathon/ui/components/button";
import { Countdown } from "@/components/shared/countdown";
import type { Event } from "@estimathon/types";

export interface LandingSession {
  email: string | null;
  hasEvent: boolean;
}

interface LandingHeroProps {
  event: Event | null;
  loginUrl: string;
  session: LandingSession | null;
}

export function LandingHero({ event, loginUrl, session }: Readonly<LandingHeroProps>) {
  const isActive = event?.status === "active" && Boolean(event.endsAt);

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-white/15 bg-portage-950/45 p-8 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        <p className="text-xs tracking-[0.2em] text-portage-50 uppercase">
          UW Data Science Club
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Estimathon
        </h1>
        <p className="mt-4 text-base leading-relaxed text-portage-100">
          Teams submit numeric ranges for estimation questions. Golf scoring - lower is better.
          Correct intervals tighten your multiplier; wrong ones blow it up.
        </p>

        {isActive && event?.endsAt ? (
          <div className="mt-10 rounded-xl border border-white/25 bg-white/15 p-6">
            <p className="text-sm font-medium text-white">{event.name}</p>
            <p className="mt-1 text-sm text-portage-100">Event in progress - ends in</p>
            <div className="mt-6 flex justify-center">
              <Countdown target={event.endsAt} light />
            </div>
          </div>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-portage-100">
            No event running right now. Check back next season.
          </p>
        )}

        {session ? (
          <div className="mt-10 space-y-4">
            {session.email ? (
              <p className="text-center text-sm text-portage-100">
                Signed in as {session.email}
              </p>
            ) : null}
            {session.hasEvent ? (
              <Button
                asChild
                variant="outline"
                className="w-full border-white/40 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white"
              >
                <Link href="/leaderboard">Leaderboard</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-portage-700 shadow-lg [a]:hover:bg-portage-100 [a]:hover:text-portage-800"
            >
              <a href={loginUrl}>{isActive ? "Sign in to play" : "Sign in"}</a>
            </Button>
            <p className="text-center text-sm text-portage-100">
              Use your UW Data Science Club account to join.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
