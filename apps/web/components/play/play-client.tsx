"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PauseCircle } from "lucide-react";
import { Button } from "@estimathon/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@estimathon/ui/components/alert";
import { TooltipProvider } from "@estimathon/ui/components/tooltip";
import { useEventStream, useLeaderboardQuery } from "@/hooks/use-event-stream";
import type { SessionIdentity } from "@/lib/auth/session";
import { Timer } from "./timer";
import { ScorePanel } from "./score-panel";
import { QuestionCard } from "./question-card";
import type {
  EditingPresence,
  Event,
  LeaderboardEntry,
  Question,
  ServerMessage,
  Submission,
  Team,
  TeamScore,
} from "@estimathon/types";

interface PlayClientProps {
  event: Event;
  team: Team;
  questions: Question[];
  initialSubmissions: Submission[];
  initialScore: TeamScore;
  initialLeaderboard?: LeaderboardEntry[];
  accessToken?: string | null;
  currentUser?: SessionIdentity | null;
}

function latestByQuestion(submissions: Submission[]): Map<string, Submission> {
  const map = new Map<string, Submission>();
  for (const s of submissions) {
    const existing = map.get(s.questionId);
    if (!existing || s.submittedAt > existing.submittedAt) {
      map.set(s.questionId, s);
    }
  }
  return map;
}

export function PlayClient({
  event,
  team,
  questions,
  initialSubmissions,
  initialScore,
  initialLeaderboard = [],
  accessToken = null,
  currentUser = null,
}: Readonly<PlayClientProps>) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [score, setScore] = useState<TeamScore>(initialScore);
  const [expired, setExpired] = useState(false);
  const [editingByQuestion, setEditingByQuestion] = useState<Map<string, EditingPresence[]>>(
    new Map()
  );
  const [timing, setTiming] = useState({
    endsAt: event.endsAt,
    pausedAt: event.pausedAt,
  });

  const onEventStatus = useCallback(
    (msg: ServerMessage & { type: "event_status" }) => {
      if (msg.status === "ended" || msg.status === "archived") {
        toast.info("Event ended");
        router.push("/results");
        return;
      }
      setTiming({ endsAt: msg.endsAt, pausedAt: msg.pausedAt });
    },
    [router]
  );

  const onSubmission = useCallback(
    (msg: ServerMessage & { type: "submission" }) => {
      if (msg.teamId !== team.id) return;
      setSubmissions((prev) => {
        // Dedup by id: the submitter's own optimistic update in handleSubmit
        // already added this row before the broadcast round-trips back.
        if (prev.some((s) => s.id === msg.submission.id)) return prev;
        const full: Submission = { ...msg.submission, teamId: msg.teamId };
        return [full, ...prev];
      });
    },
    [team.id]
  );

  const onEditing = useCallback((msg: ServerMessage & { type: "editing" }) => {
    setEditingByQuestion((prev) => {
      const next = new Map(prev);
      if (msg.editors.length === 0) next.delete(msg.questionId);
      else next.set(msg.questionId, msg.editors);
      return next;
    });
  }, []);

  const onTeamScore = useCallback((s: TeamScore) => setScore({ ...s }), []);

  useEventStream({
    eventId: accessToken ? event.id : null,
    accessToken,
    teamId: team.id,
    onTeamScore,
    onEventStatus,
    onSubmission,
    onEditing,
  });

  const { data: leaderboard } = useLeaderboardQuery(event.id, initialLeaderboard);

  const latest = useMemo(() => latestByQuestion(submissions), [submissions]);
  const correctByQuestion = useMemo(
    () => new Map(score.evaluations.map((e) => [e.questionId, e.correct])),
    [score.evaluations]
  );
  const remaining = Math.max(0, event.submissionCap - score.submissionCount);
  const locked = expired || Boolean(timing.pausedAt) || remaining === 0;

  async function handleSubmit(questionId: string, min: number, max: number) {
    if (locked) {
      if (expired) toast.error("Time's up");
      else if (remaining === 0) toast.error("Submission limit reached");
      else toast.error("Event is paused");
      return;
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
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Submission failed");
      throw new Error(data.error || "Submission failed");
    }
    const { submission, teamScore } = data as {
      submission: Submission;
      teamScore: TeamScore;
    };
    setSubmissions((prev) => [submission, ...prev]);
    setScore(teamScore);
  }

  function handleExpire() {
    if (expired) return;
    setExpired(true);
    toast.info("Time's up");
    // No router.refresh() here: with 50-75 players the local countdown hits
    // zero for everyone within the same second, and a refresh is a 5-request
    // page reload (see PlayPage) - a synchronized burst that alone can trip
    // the per-user rate limit. Nothing here needs a refetch: the server
    // independently enforces the event window (submissions.service.ts checks
    // `now > event.endsAt`), and an actual status change to "ended"/"archived"
    // still arrives - and redirects - via the onEventStatus SSE handler above.
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-4">
          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              {event.name}
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {team.name ?? `Team ${team.code}`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                code <span className="font-mono">{team.code}</span>
              </span>
            </h1>
          </div>
          {/* PlayClient only renders for an active event, which always has a
            timer running - endsAt is guaranteed set at that point. */}
          <Timer endsAt={timing.endsAt!} pausedAt={timing.pausedAt} onExpire={handleExpire} />
        </div>

        {timing.pausedAt && (
          <Alert>
            <PauseCircle />
            <AlertTitle>The host paused the event</AlertTitle>
            <AlertDescription>Submissions are locked until it resumes.</AlertDescription>
          </Alert>
        )}

        <ScorePanel
          score={score.score}
          goodIntervals={score.goodIntervals}
          remaining={remaining}
          questionCount={event.questionCount}
        />

        <div className="grid gap-3">
          {questions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No questions yet. Hang tight.
            </div>
          ) : (
            questions.map((q) => {
              const editors = (editingByQuestion.get(q.id) ?? []).filter(
                (e) => e.userId !== currentUser?.userId
              );
              return (
                <QuestionCard
                  key={q.id}
                  question={q}
                  latest={latest.get(q.id) ?? null}
                  disabled={locked}
                  onSubmit={(min, max) => handleSubmit(q.id, min, max)}
                  editors={editors}
                  correct={correctByQuestion.get(q.id)}
                  presence={
                    currentUser
                      ? { eventId: event.id, teamId: team.id, currentUser }
                      : undefined
                  }
                />
              );
            })
          )}
        </div>

        {accessToken && leaderboard.length > 0 && (
          <section className="grid gap-3 border-t pt-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Leaderboard</h2>
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
                  <span className="w-6 text-muted-foreground tabular-nums">{i + 1}</span>
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
    </TooltipProvider>
  );
}
