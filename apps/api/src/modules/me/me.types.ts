import type { Event, Team } from "@estimathon/types"

export interface MeRecord {
  userId: string
  team: Team | null
  event: Event | null
}
