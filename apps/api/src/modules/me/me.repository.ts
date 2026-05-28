import { queryOne } from "@estimathon/db"
import type { Event, Team } from "@estimathon/types"
import type { EventRow } from "../events/events.types"
import { rowToEvent } from "../events/events.repository"
import type { TeamRow } from "../teams/teams.types"

const SELECTABLE_EVENT_STATUSES = ["active", "ended"] as const

function rowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    eventId: row.event_id,
    code: row.code,
    name: row.name,
    createdAt: row.created_at,
  }
}

export class MeRepository {
  /**
   * The latest event that's visible to players: active or recently ended.
   * Drafts and archived events are hidden.
   */
  async getCurrentEvent(): Promise<Event | null> {
    const row = await queryOne<EventRow>(
      `select * from events
       where status = any($1)
       order by case status when 'active' then 0 else 1 end,
                starts_at desc
       limit 1`,
      [SELECTABLE_EVENT_STATUSES]
    )
    return row ? rowToEvent(row) : null
  }

  /**
   * The user's team for a given event, if any.
   */
  async getTeamForUser(userId: string, eventId: string): Promise<Team | null> {
    const row = await queryOne<TeamRow>(
      `select t.* from teams t
       join team_members m on m.team_id = t.id
       where m.user_id = $1 and m.event_id = $2`,
      [userId, eventId]
    )
    return row ? rowToTeam(row) : null
  }
}
