import type { Event } from "@estimathon/types"
import type { EventHub } from "../realtime/event-hub"
import { EventsRepository } from "./events.repository"
import type { CreateEventInput, UpdateEventInput } from "./events.types"

class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

function validateStartsAt(startsAt: string) {
  const start = Date.parse(startsAt)
  if (Number.isNaN(start)) throw new HttpError(400, "Invalid startsAt")
}

function validateDuration(durationMinutes: number) {
  if (
    !Number.isFinite(durationMinutes) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new HttpError(400, "durationMinutes must be a positive integer")
  }
}

export class EventsService {
  constructor(
    private readonly repository: EventsRepository,
    private readonly hub?: EventHub
  ) {}

  async getActive(): Promise<Event | null> {
    return this.repository.findCurrent()
  }

  async getById(id: string): Promise<Event> {
    const event = await this.repository.findById(id)
    if (!event) throw new HttpError(404, "Event not found")
    return event
  }

  async list(): Promise<Event[]> {
    return this.repository.list()
  }

  async create(input: CreateEventInput): Promise<Event> {
    if (!input.name?.trim()) throw new HttpError(400, "Name is required")
    validateStartsAt(input.startsAt)
    validateDuration(input.durationMinutes)
    return this.repository.create(input)
  }

  async update(id: string, input: UpdateEventInput): Promise<Event> {
    const existing = await this.repository.findById(id)
    if (!existing) throw new HttpError(404, "Event not found")
    if (input.startsAt !== undefined) validateStartsAt(input.startsAt)
    if (input.durationMinutes !== undefined)
      validateDuration(input.durationMinutes)
    const updated = await this.repository.update(id, input)
    if (!updated) throw new HttpError(404, "Event not found")
    if (input.status !== undefined && input.status !== existing.status) {
      this.hub?.publish(updated.id, {
        type: "event_status",
        eventId: updated.id,
        status: updated.status,
        startsAt: updated.startsAt,
        endsAt: updated.endsAt,
      })
    }
    return updated
  }
}

export { HttpError }
