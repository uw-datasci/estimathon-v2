"use client";

import Link from "next/link";
import { Button } from "@estimathon/ui/components/button";
import { Countdown } from "@/components/shared/countdown";
import type { Event } from "@estimathon/types";

interface LandingHeroProps {
  event: Event | null;
  isLoggedIn: boolean;
  loginHref: string;
}

export function LandingHero({ event, isLoggedIn, loginHref }: Readonly<LandingHeroProps>) {
  const isActive = event?.status === "active" && Boolean(event.endsAt);

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-white/15 bg-portage-950/45 p-8 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        <p className="text-xs tracking-[0.2em] text-portage-50 uppercase">UW Data Science Club</p>
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

        <div className="mt-10 flex flex-wrap gap-3">
          {isLoggedIn ? (
            <>
              <Button asChild className="bg-white text-portage-700 shadow-lg hover:bg-portage-50">
                <Link href="/play">Enter event</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/40 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white"
              >
                <Link href="/leaderboard">Leaderboard</Link>
              </Button>
            </>
          ) : (
            <Button asChild className="bg-white text-portage-700 shadow-lg hover:bg-portage-50">
              <a href={loginHref}>Log in with club account</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
