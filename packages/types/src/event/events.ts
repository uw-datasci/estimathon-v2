export type EventStatus = "draft" | "active" | "ended" | "archived"

export interface Event {
  id: string
  name: string
  startsAt: string
  /** Game length in minutes. Stored on the row. */
  durationMinutes: number
  /** Derived: `startsAt + durationMinutes minutes` as ISO. Computed by the API. */
  endsAt: string
  teamSizeCap: number
  submissionCap: number
  questionCount: number
  status: EventStatus
  createdAt: string
}
