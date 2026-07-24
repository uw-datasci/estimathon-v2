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
    const row = await queryOne<EventRow>(`select * from events where id = $1`, [id]);
    return row ? EventsRepository.rowToEvent(row) : null;
  }

  /**
   * Latest player-visible event: active, or ended within the recent window.
   * Drafts and archived events are excluded.
   */
  async findCurrent(): Promise<Event | null> {
    const row = await queryOne<EventRow>(
      `select * from events
       where status = 'active'
          or (status = 'ended'
              and ends_at is not null
              and ends_at > now() - make_interval(hours => $1))
       order by case status when 'active' then 0 else 1 end,
                starts_at desc
       limit 1`,
      [EventsRepository.recentlyEndedWindowHours]
    );
    return row ? EventsRepository.rowToEvent(row) : null;
  }

  async list(): Promise<Event[]> {
    const rows = await query<EventRow>(
      `select * from events order by starts_at desc nulls last`
    );
    return rows.map(EventsRepository.rowToEvent);
  }

  async create(input: CreateEventInput): Promise<Event> {
    const row = await queryOne<EventRow>(
      `insert into events
         (name, duration_minutes, team_size_cap, submission_cap)
       values ($1, $2, $3, $4)
       returning *`,
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
      `update events set ${sets.join(", ")} where id = $${params.length} returning *`,
      params
    );
    return row ? EventsRepository.rowToEvent(row) : null;
  }
}
