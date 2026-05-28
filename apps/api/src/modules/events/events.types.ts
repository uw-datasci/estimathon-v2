import type { Event, EventStatus } from "@estimathon/types"

export interface CreateEventInput {
  name: string
  startsAt: string
  durationMinutes: number
  teamSizeCap?: number
  submissionCap?: number
  questionCount?: number
  status?: EventStatus
}

export interface UpdateEventInput {
  name?: string
  startsAt?: string
  durationMinutes?: number
  teamSizeCap?: number
  submissionCap?: number
  questionCount?: number
  status?: EventStatus
}

export interface EventRow {
  id: string
  name: string
  starts_at: string
  duration_minutes: number
  team_size_cap: number
  submission_cap: number
  question_count: number
  status: Event["status"]
  created_at: string
}
