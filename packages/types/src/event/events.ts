export type EventStatus = "draft" | "active" | "ended" | "archived"

export interface Event {
  id: string
  name: string
  /** Null until the event is started - drafts have no start time. */
  startsAt: string | null
  /** Game length in minutes. Stored on the row. */
  durationMinutes: number
  /**
   * Stored end of the timer, set on start as `startsAt + durationMinutes`
   * and nudged by pause/resume and +/-30s adjustments. Null until started.
   */
  endsAt: string | null
  /** Set while the live timer is paused; the frozen remaining time is `endsAt - pausedAt`. */
  pausedAt: string | null
  teamSizeCap: number
  /** Submission cap. Also doubles as the number of questions (one submission per question). */
  submissionCap: number
  status: EventStatus
  createdAt: string
}
