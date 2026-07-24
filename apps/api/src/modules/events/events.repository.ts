import { query, queryOne } from "@estimathon/db";
import type { Event } from "@estimathon/types";
import type { CreateEventInput, EventRow, UpdateEventInput } from "./events.types";

export class EventsRepository {
  private static readonly recentlyEndedWindowHours = 24;

  private static rowToEvent(row: EventRow): Event {
    return {
      id: row.id,
      name: row.name,
      startsAt: row.starts_at,
      durationMinutes: row.duration_minutes,
      endsAt: row.ends_at,
      pausedAt: row.paused_at,
      teamSizeCap: row.team_size_cap,
      submissionCap: row.submission_cap,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<Event | null> {
    const row = await queryOne<EventRow>(`SELECT * FROM events WHERE id = $1`, [id]);
    return row ? EventsRepository.rowToEvent(row) : null;
  }

  /**
   * Latest player-visible event: active, or ended within the recent window.
   * Drafts and archived events are excluded.
   */
  async findCurrent(): Promise<Event | null> {
    const row = await queryOne<EventRow>(
      `SELECT * FROM events
       WHERE (status = 'active'
              AND ends_at IS NOT NULL
              AND ends_at > now())
          OR (status = 'ended'
              AND ends_at IS NOT NULL
              AND ends_at <= now()
              AND ends_at > now() - make_interval(hours => $1))
       ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END,
                starts_at DESC
       LIMIT 1`,
      [EventsRepository.recentlyEndedWindowHours]
    );
    return row ? EventsRepository.rowToEvent(row) : null;
  }

  async list(): Promise<Event[]> {
    const rows = await query<EventRow>(
      `SELECT * FROM events ORDER BY starts_at DESC NULLS LAST`
    );
    return rows.map(EventsRepository.rowToEvent);
  }

  async create(input: CreateEventInput): Promise<Event> {
    const row = await queryOne<EventRow>(
      `INSERT INTO events
         (name, duration_minutes, team_size_cap, submission_cap)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.name, input.durationMinutes, input.teamSizeCap ?? 5, input.submissionCap ?? 18]
    );
    if (!row) throw new Error("Insert returned no row");
    return EventsRepository.rowToEvent(row);
  }

  async update(id: string, input: UpdateEventInput): Promise<Event | null> {
    const sets: string[] = [];
    const params: unknown[] = [];
    const push = (col: string, value: unknown) => {
      params.push(value);
      sets.push(`${col} = $${params.length}`);
    };
    if (input.name !== undefined) push("name", input.name);
    if (input.startsAt !== undefined) push("starts_at", input.startsAt);
    if (input.durationMinutes !== undefined) push("duration_minutes", input.durationMinutes);
    if (input.teamSizeCap !== undefined) push("team_size_cap", input.teamSizeCap);
    if (input.submissionCap !== undefined) push("submission_cap", input.submissionCap);
    if (input.status !== undefined) push("status", input.status);
    if (input.endsAt !== undefined) push("ends_at", input.endsAt);
    if (input.pausedAt !== undefined) push("paused_at", input.pausedAt);

    if (sets.length === 0) return this.findById(id);

    params.push(id);
    const row = await queryOne<EventRow>(
      `UPDATE events SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return row ? EventsRepository.rowToEvent(row) : null;
  }
}
