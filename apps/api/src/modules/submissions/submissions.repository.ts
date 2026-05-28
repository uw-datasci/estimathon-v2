import { query, queryOne } from "@estimathon/db"
import type { Submission } from "@estimathon/types"
import type { SubmissionRow } from "./submissions.types"

function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: Number(row.id),
    teamId: row.team_id,
    questionId: row.question_id,
    userId: row.user_id,
    minValue: Number(row.min_value),
    maxValue: Number(row.max_value),
    submittedAt: row.submitted_at,
  }
}

export class SubmissionsRepository {
  async insert(input: {
    teamId: string
    questionId: string
    userId: string
    minValue: number
    maxValue: number
  }): Promise<Submission> {
    const row = await queryOne<SubmissionRow>(
      `insert into submissions
         (team_id, question_id, user_id, min_value, max_value)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [
        input.teamId,
        input.questionId,
        input.userId,
        input.minValue,
        input.maxValue,
      ]
    )
    if (!row) throw new Error("Insert returned no row")
    return rowToSubmission(row)
  }

  async listForTeam(teamId: string): Promise<Submission[]> {
    const rows = await query<SubmissionRow>(
      `select * from submissions where team_id = $1 order by submitted_at desc`,
      [teamId]
    )
    return rows.map(rowToSubmission)
  }

  async countForTeam(teamId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `select count(*)::text as count from submissions where team_id = $1`,
      [teamId]
    )
    return row ? Number(row.count) : 0
  }

  async listForEvent(eventId: string): Promise<Submission[]> {
    const rows = await query<SubmissionRow>(
      `select s.* from submissions s
       join teams t on t.id = s.team_id
       where t.event_id = $1
       order by s.submitted_at desc`,
      [eventId]
    )
    return rows.map(rowToSubmission)
  }
}
