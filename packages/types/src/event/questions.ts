export interface Question {
  id: string
  eventId: string
  position: number
  prompt: string
  releasedAt: string | null
  /** Only present in admin contexts. */
  answer?: number
  createdAt: string
}
