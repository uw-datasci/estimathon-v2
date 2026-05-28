import type { Profile } from "../auth/user.js"

export interface TeamScore {
  teamId: string
  score: number
  goodIntervals: number
  submissionCount: number
}

export interface LeaderboardEntry extends TeamScore {
  code: string
  name: string | null
  members: Array<Pick<Profile, "firstName" | "lastName"> & { id: string }>
}
