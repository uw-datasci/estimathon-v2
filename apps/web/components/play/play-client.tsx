"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@estimathon/ui/components/button"
import { useEventStream, useLeaderboardQuery } from "@/hooks/use-event-stream"
import { Timer } from "./timer"
import { ScorePanel } from "./score-panel"
import { QuestionCard } from "./question-card"
import type {
  Event,
  LeaderboardEntry,
  Question,
  Submission,
  Team,
  TeamScore,
} from "@estimathon/types"

interface PlayClientProps {
  event: Event
  team: Team
  questions: Question[]
  initialSubmissions: Submission[]
  initialScore: TeamScore
  initialLeaderboard?: LeaderboardEntry[]
  accessToken?: string | null
}

function latestByQuestion(submissions: Submission[]): Map<string, Submission> {
  const map = new Map<string, Submission>()
  for (const s of submissions) {
    const existing = map.get(s.questionId)
    if (!existing || s.submittedAt > existing.submittedAt) {
      map.set(s.questionId, s)
    }
  }
  return map
}

export function PlayClient({
  event,
  team,
  questions,
  initialSubmissions,
  initialScore,
  initialLeaderboard = [],
  accessToken = null,
}: PlayClientProps) {
  const router = useRouter()
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions)
  const [score, setScore] = useState<TeamScore>(initialScore)
  const [expired, setExpired] = useState(false)

  const onEventStatus = useCallback(
    (msg: { status: Event["status"] }) => {
      if (msg.status === "ended" || msg.status === "archived") {
        toast.info("Event ended")
        router.push("/results")
      }
    },
    [router]
  )

  useEventStream({
    eventId: accessToken ? event.id : null,
    accessToken,
    teamId: team.id,
    onTeamScore: (s) => setScore({ ...s }),
    onEventStatus,
  })

  const { data: leaderboard } = useLeaderboardQuery(
    event.id,
    initialLeaderboard
  )

  const latest = useMemo(() => latestByQuestion(submissions), [submissions])
  const remaining = Math.max(0, event.submissionCap - score.submissionCount)
  const locked = expired || remaining <= 0

  async function handleSubmit(
    questionId: string,
    min: number,
    max: number
  ) {
    if (locked) {
      toast.error(expired ? "Time's up" : "Out of guesses")
      return
    }
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: team.id,
        questionId,
        minValue: min,
        maxValue: max,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Submission failed")
      throw new Error(data.error || "Submission failed")
    }
    const { submission, teamScore } = data as {
      submission: Submission
      teamScore: TeamScore
    }
    setSubmissions((prev) => [submission, ...prev])
    setScore(teamScore)
  }

  function handleExpire() {
    if (expired) return
    setExpired(true)
    toast.info("Time's up")
    router.refresh()
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
            {event.name}
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            {team.name ?? `Team ${team.code}`}
            <span className="text-muted-foreground ml-2 font-normal text-sm">
              code <span className="font-mono">{team.code}</span>
            </span>
          </h1>
        </div>
        <Timer endsAt={event.endsAt} onExpire={handleExpire} />
      </div>

      <ScorePanel
        score={score.score}
        goodIntervals={score.goodIntervals}
        questionCount={event.questionCount}
        submissionCount={score.submissionCount}
        submissionCap={event.submissionCap}
      />

      <div className="grid gap-3">
        {questions.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No questions have been released yet. Hang tight.
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              latest={latest.get(q.id) ?? null}
              disabled={locked}
              onSubmit={(min, max) => handleSubmit(q.id, min, max)}
            />
          ))
        )}
      </div>

      {accessToken && leaderboard.length > 0 && (
        <section className="grid gap-3 border-t pt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Leaderboard
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/leaderboard">Full view →</Link>
            </Button>
          </div>
          <ol className="divide-y rounded-lg border text-sm">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <li
                key={entry.teamId}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <span className="text-muted-foreground w-6 tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {entry.name ?? entry.code}
                </span>
                <span className="font-semibold tabular-nums">{entry.score}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
