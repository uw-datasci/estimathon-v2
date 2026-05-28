import { query, queryOne } from "@estimathon/db"
import type { Event } from "@estimathon/types"
import type {
  CreateEventInput,
  EventRow,
  UpdateEventInput,
} from "./events.types"

export function rowToEvent(row: EventRow): Event {
  const startMs = new Date(row.starts_at).getTime()
  const endsAt = new Date(startMs + row.duration_minutes * 60_000).toISOString()
  return {
    id: row.id,
    name: row.name,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    endsAt,
    teamSizeCap: row.team_size_cap,
    submissionCap: row.submission_cap,
    questionCount: row.question_count,
    status: row.status,
    createdAt: row.created_at,
  }
}

export class EventsRepository {
  async findById(id: string): Promise<Event | null> {
    const row = await queryOne<EventRow>(`select * from events where id = $1`, [
      id,
    ])
    return row ? rowToEvent(row) : null
  }

  async findCurrent(): Promise<Event | null> {
    const row = await queryOne<EventRow>(
      `select * from events
       where status in ('active','ended')
       order by case status when 'active' then 0 else 1 end,
                starts_at desc
       limit 1`
    )
    return row ? rowToEvent(row) : null
  }

  async list(): Promise<Event[]> {
    const rows = await query<EventRow>(
      `select * from events order by starts_at desc`
    )
    return rows.map(rowToEvent)
  }

  async create(input: CreateEventInput): Promise<Event> {
    const row = await queryOne<EventRow>(
      `insert into events
         (name, starts_at, duration_minutes,
          team_size_cap, submission_cap, question_count, status)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [
        input.name,
        input.startsAt,
        input.durationMinutes,
        input.teamSizeCap ?? 5,
        input.submissionCap ?? 18,
        input.questionCount ?? 13,
        input.status ?? "draft",
      ]
    )
    if (!row) throw new Error("Insert returned no row")
    return rowToEvent(row)
  }

  async update(id: string, input: UpdateEventInput): Promise<Event | null> {
    const sets: string[] = []
    const params: unknown[] = []
    const push = (col: string, value: unknown) => {
      params.push(value)
      sets.push(`${col} = $${params.length}`)
    }
    if (input.name !== undefined) push("name", input.name)
    if (input.startsAt !== undefined) push("starts_at", input.startsAt)
    if (input.durationMinutes !== undefined)
      push("duration_minutes", input.durationMinutes)
    if (input.teamSizeCap !== undefined)
      push("team_size_cap", input.teamSizeCap)
    if (input.submissionCap !== undefined)
      push("submission_cap", input.submissionCap)
    if (input.questionCount !== undefined)
      push("question_count", input.questionCount)
    if (input.status !== undefined) push("status", input.status)

    if (sets.length === 0) return this.findById(id)

    params.push(id)
    const row = await queryOne<EventRow>(
      `update events set ${sets.join(", ")} where id = $${params.length} returning *`,
      params
    )
    return row ? rowToEvent(row) : null
  }
}
