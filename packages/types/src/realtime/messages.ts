import type { EventStatus } from "../event/events.js"
import type { LeaderboardEntry } from "../event/scoring.js"
import type { Submission } from "../event/submissions.js"

export type ServerMessage =
  | { type: "leaderboard"; eventId: string; data: LeaderboardEntry[] }
  | {
      type: "team_score"
      eventId: string
      teamId: string
      score: number
      goodIntervals: number
      submissionCount: number
    }
  | {
      type: "event_status"
      eventId: string
      status: EventStatus
      startsAt: string
      endsAt: string
    }
  | {
      type: "question_released"
      eventId: string
      questionId: string
      position: number
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
        "id" | "questionId" | "minValue" | "maxValue" | "submittedAt"
      >
    }
  | { type: "heartbeat"; ts: number }
