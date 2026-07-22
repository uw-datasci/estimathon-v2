import type { Event } from "@estimathon/types";
import type { EventHub } from "../realtime/event-hub";
import { QuestionsRepository } from "../questions/questions.repository";
import { EventsRepository } from "./events.repository";
import type { CreateEventInput, UpdateEventInput } from "./events.types";

const ADD_TIME_STEP_SECONDS = 30;

class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

function validateStartsAt(startsAt: string) {
  const start = Date.parse(startsAt);
  if (Number.isNaN(start)) throw new HttpError(400, "Invalid startsAt");
  if (start <= Date.now()) throw new HttpError(400, "startsAt must be in the future");
}

function validateDuration(durationMinutes: number) {
  if (
    !Number.isFinite(durationMinutes) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new HttpError(400, "durationMinutes must be a positive integer");
  }
}

export class EventsService {
  constructor(
    private readonly repository: EventsRepository,
    private readonly hub?: EventHub,
    private readonly questions?: QuestionsRepository
  ) {}

  async getActive(): Promise<Event | null> {
    return this.repository.findCurrent();
  }

  async getById(id: string): Promise<Event> {
    const event = await this.repository.findById(id);
    if (!event) throw new HttpError(404, "Event not found");
    return event;
  }

  async list(): Promise<Event[]> {
    return this.repository.list();
  }

  async create(input: CreateEventInput): Promise<Event> {
    if (!input.name?.trim()) throw new HttpError(400, "Name is required");
    validateDuration(input.durationMinutes);
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateEventInput): Promise<Event> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new HttpError(404, "Event not found");
    if (input.startsAt !== undefined && input.startsAt !== null)
      validateStartsAt(input.startsAt);
    if (input.durationMinutes !== undefined) validateDuration(input.durationMinutes);
    // starts_at is nullable only for draft events (DB-enforced) - leaving
    // draft without a start time would violate that, so use /start instead.
    const nextStatus = input.status ?? existing.status;
    const nextStartsAt = input.startsAt !== undefined ? input.startsAt : existing.startsAt;
    if (nextStatus !== "draft" && !nextStartsAt) {
      throw new HttpError(
        400,
        "Use POST /admin/events/:id/start to move an event out of draft"
      );
    }
    const updated = await this.repository.update(id, input);
    if (!updated) throw new HttpError(404, "Event not found");
    if (input.status !== undefined && input.status !== existing.status) {
      this.broadcastStatus(updated);
    }
    return updated;
  }

  /** Start a draft event at a scheduled (future) time. Requires the number
   * of questions added so far to match the submission cap - the event must
   * have all its questions ready before it goes live. */
  async start(id: string, startsAt: string): Promise<Event> {
    const event = await this.repository.findById(id);
    if (!event) throw new HttpError(404, "Event not found");
    if (event.status !== "draft") throw new HttpError(400, "Only draft events can be started");
    validateStartsAt(startsAt);

    const questionCount = (await this.questions?.countForEvent(id)) ?? 0;
    if (questionCount !== event.submissionCap) {
      throw new HttpError(
        400,
        `Add ${event.submissionCap} question(s) to match the submission cap before starting (currently ${questionCount})`
      );
    }

    const endsAt = new Date(
      Date.parse(startsAt) + event.durationMinutes * 60_000
    ).toISOString();
    const updated = await this.repository.update(id, {
      startsAt,
      endsAt,
      pausedAt: null,
      status: "active",
    });
    if (!updated) throw new HttpError(404, "Event not found");
    this.broadcastStatus(updated);
    return updated;
  }

  /** Freeze the live timer. Remaining time is `endsAt - pausedAt`. */
  async pause(id: string): Promise<Event> {
    const event = await this.requireActive(id);
    if (event.pausedAt) throw new HttpError(400, "Event is already paused");
    const updated = await this.repository.update(id, {
      pausedAt: new Date().toISOString(),
    });
    if (!updated) throw new HttpError(404, "Event not found");
    this.broadcastStatus(updated);
    return updated;
  }

  /** Resume a paused timer, shifting endsAt forward by the paused duration. */
  async resume(id: string): Promise<Event> {
    const event = await this.requireActive(id);
    if (!event.pausedAt) throw new HttpError(400, "Event isn't paused");
    if (!event.endsAt) throw new HttpError(400, "Event has no timer");
    const pausedMs = Date.now() - Date.parse(event.pausedAt);
    const endsAt = new Date(Date.parse(event.endsAt) + pausedMs).toISOString();
    const updated = await this.repository.update(id, {
      endsAt,
      pausedAt: null,
    });
    if (!updated) throw new HttpError(404, "Event not found");
    this.broadcastStatus(updated);
    return updated;
  }

  /** Nudge the timer by +/-30s increments. Works while paused too, since the
   * frozen remaining time is `endsAt - pausedAt`. Clamped so remaining time
   * never goes negative. */
  async addTime(id: string, seconds: number): Promise<Event> {
    const event = await this.requireActive(id);
    if (!event.endsAt) throw new HttpError(400, "Event has no timer");
    if (!Number.isInteger(seconds) || seconds % ADD_TIME_STEP_SECONDS !== 0 || seconds === 0) {
      throw new HttpError(
        400,
        `seconds must be a non-zero multiple of ${ADD_TIME_STEP_SECONDS}`
      );
    }
    const anchor = event.pausedAt ?? new Date().toISOString();
    const floorMs = Date.parse(anchor);
    const newEndsMs = Math.max(floorMs, Date.parse(event.endsAt) + seconds * 1000);
    const updated = await this.repository.update(id, {
      endsAt: new Date(newEndsMs).toISOString(),
    });
    if (!updated) throw new HttpError(404, "Event not found");
    this.broadcastStatus(updated);
    return updated;
  }

  private async requireActive(id: string): Promise<Event> {
    const event = await this.repository.findById(id);
    if (!event) throw new HttpError(404, "Event not found");
    if (event.status !== "active") throw new HttpError(400, "Event isn't active");
    return event;
  }

  private broadcastStatus(event: Event) {
    this.hub?.publish(event.id, {
      type: "event_status",
      eventId: event.id,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      pausedAt: event.pausedAt,
    });
  }
}

export { HttpError };
