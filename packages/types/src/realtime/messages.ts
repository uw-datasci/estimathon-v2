import type { EventStatus } from "../event/events.js"
import type { LeaderboardEntry, QuestionEvaluation } from "../event/scoring.js"
import type { Submission } from "../event/submissions.js"

export interface EditingPresence {
  userId: string
  name: string
  avatarUrl: string | null
}

export type ServerMessage =
  | { type: "leaderboard"; eventId: string; data: LeaderboardEntry[] }
  | {
      type: "team_score"
      eventId: string
      teamId: string
      score: number
      goodIntervals: number
      submissionCount: number
      evaluations: QuestionEvaluation[]
    }
  | {
      type: "event_status"
      eventId: string
      status: EventStatus
      startsAt: string
      endsAt: string
    }
  | { type: "announcement"; eventId: string; message: string }
  | {
      type: "submission"
      eventId: string
      teamId: string
      teamCode: string
      teamName: string | null
      submission: Pick<
        Submission,
        "id" | "questionId" | "userId" | "minValue" | "maxValue" | "submittedAt"
      >
    }
  | {
      type: "editing"
      eventId: string
      teamId: string
      questionId: string
      editors: EditingPresence[]
    }
  | { type: "heartbeat"; ts: number }
