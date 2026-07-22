import type { Event, EventStatus } from "@estimathon/types"

export interface CreateEventInput {
  name: string
  durationMinutes: number
  teamSizeCap?: number
  submissionCap?: number
}

export interface UpdateEventInput {
  name?: string
  startsAt?: string | null
  durationMinutes?: number
  teamSizeCap?: number
  submissionCap?: number
  status?: EventStatus
  endsAt?: string | null
  pausedAt?: string | null
}

export interface EventRow {
  id: string
  name: string
  starts_at: string | null
  duration_minutes: number
  team_size_cap: number
  submission_cap: number
  status: Event["status"]
  created_at: string
  ends_at: string | null
  paused_at: string | null
}
