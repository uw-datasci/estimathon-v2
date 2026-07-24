import { pool, query, queryOne, transaction } from "@estimathon/db";
import type { Team } from "@estimathon/types";
import type { TeamMemberRow, TeamRow } from "./teams.types";

export class TeamsRepository {
  private static rowToTeam(row: TeamRow): Team {
    return {
      id: row.id,
      eventId: row.event_id,
      code: row.code,
      name: row.name,
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<Team | null> {
    const row = await queryOne<TeamRow>(`select * from teams where id = $1`, [id]);
    return row ? TeamsRepository.rowToTeam(row) : null;
  }

  async listForEvent(eventId: string): Promise<Team[]> {
    const rows = await query<TeamRow>(
      `select * from teams where event_id = $1 order by created_at asc`,
      [eventId]
    );
    return rows.map(TeamsRepository.rowToTeam);
  }

  async findByCode(eventId: string, code: string): Promise<Team | null> {
    const row = await queryOne<TeamRow>(
      `select * from teams where event_id = $1 and code = $2`,
      [eventId, code]
    );
    return row ? TeamsRepository.rowToTeam(row) : null;
  }

  async codeExists(eventId: string, code: string): Promise<boolean> {
    const row = await queryOne<{ exists: boolean }>(
      `select exists(select 1 from teams where event_id = $1 and code = $2) as exists`,
      [eventId, code]
    );
    return row?.exists ?? false;
  }

  async getMembershipForUser(userId: string, eventId: string): Promise<TeamMemberRow | null> {
    return queryOne<TeamMemberRow>(
      `select * from team_members where user_id = $1 and event_id = $2`,
      [userId, eventId]
    );
  }

  /** The user's team for a given event, if any. */
  async getTeamForUser(userId: string, eventId: string): Promise<Team | null> {
    const row = await queryOne<TeamRow>(
      `select t.* from teams t
       join team_members m on m.team_id = t.id
       where m.user_id = $1 and m.event_id = $2`,
      [userId, eventId]
    );
    return row ? TeamsRepository.rowToTeam(row) : null;
  }

  async countMembers(teamId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `select count(*)::text as count from team_members where team_id = $1`,
      [teamId]
    );
    return row ? Number(row.count) : 0;
  }

  async listMembers(teamId: string): Promise<TeamMemberRow[]> {
    return query<TeamMemberRow>(
      `select * from team_members where team_id = $1 order by joined_at asc`,
      [teamId]
    );
  }

  /**
   * Create a team + add the creator as the first member, atomically.
   */
  async createWithCreator(input: {
    eventId: string;
    code: string;
    name: string | null;
    creatorUserId: string;
  }): Promise<Team> {
    return transaction(async (tx) => {
      const [teamRow] = await tx.query<TeamRow>(
        `insert into teams (event_id, code, name) values ($1, $2, $3) returning *`,
        [input.eventId, input.code, input.name]
      );
      if (!teamRow) throw new Error("Insert team returned no row");
      await tx.query(
        `insert into team_members (team_id, event_id, user_id) values ($1, $2, $3)`,
        [teamRow.id, input.eventId, input.creatorUserId]
      );
      return TeamsRepository.rowToTeam(teamRow);
    });
  }

  async addMember(input: { teamId: string; eventId: string; userId: string }): Promise<void> {
    await pool.query(
      `insert into team_members (team_id, event_id, user_id) values ($1, $2, $3)`,
      [input.teamId, input.eventId, input.userId]
    );
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await pool.query(`delete from team_members where team_id = $1 and user_id = $2`, [
      teamId,
      userId,
    ]);
  }

  /** Delete the team if it has no members. */
  async deleteIfEmpty(teamId: string): Promise<void> {
    await pool.query(
      `delete from teams where id = $1 and not exists (
         select 1 from team_members where team_id = $1
       )`,
      [teamId]
    );
  }
}
