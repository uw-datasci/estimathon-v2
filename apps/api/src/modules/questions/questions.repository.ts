import { pool, query, queryOne } from "@estimathon/db"
import type { Question } from "@estimathon/types"
import type { QuestionRow } from "./questions.types"

function rowToQuestion(row: QuestionRow, includeAnswer: boolean): Question {
  const base: Question = {
    id: row.id,
    eventId: row.event_id,
    position: row.position,
    prompt: row.prompt,
    createdAt: row.created_at,
  }
  if (includeAnswer) base.answer = Number(row.answer)
  return base
}

export class QuestionsRepository {
  async findById(id: string): Promise<Question | null> {
    const row = await queryOne<QuestionRow>(
      `select * from questions where id = $1`,
      [id]
    )
    return row ? rowToQuestion(row, true) : null
  }

  async listForEvent(
    eventId: string,
    options: { includeAnswer: boolean }
  ): Promise<Question[]> {
    const rows = await query<QuestionRow>(
      `select * from questions where event_id = $1 order by position asc`,
      [eventId]
    )
    return rows.map((r) => rowToQuestion(r, options.includeAnswer))
  }

  async countForEvent(eventId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `select count(*) as count from questions where event_id = $1`,
      [eventId]
    )
    return Number(row?.count ?? 0)
  }

  async nextPosition(eventId: string): Promise<number> {
    const row = await queryOne<{ max: number | null }>(
      `select max(position) as max from questions where event_id = $1`,
      [eventId]
    )
    return (row?.max ?? 0) + 1
  }

  async create(input: {
    eventId: string
    position: number
    prompt: string
    answer: number
  }): Promise<Question> {
    const row = await queryOne<QuestionRow>(
      `insert into questions (event_id, position, prompt, answer)
       values ($1, $2, $3, $4)
       returning *`,
      [input.eventId, input.position, input.prompt, input.answer]
    )
    if (!row) throw new Error("Insert returned no row")
    return rowToQuestion(row, true)
  }

  async update(
    id: string,
    input: {
      prompt?: string
      answer?: number
      position?: number
    }
  ): Promise<Question | null> {
    const sets: string[] = []
    const params: unknown[] = []
    const push = (col: string, value: unknown) => {
      params.push(value)
      sets.push(`${col} = $${params.length}`)
    }
    if (input.prompt !== undefined) push("prompt", input.prompt)
    if (input.answer !== undefined) push("answer", input.answer)
    if (input.position !== undefined) push("position", input.position)
    if (sets.length === 0) return this.findById(id)

    params.push(id)
    const row = await queryOne<QuestionRow>(
      `update questions set ${sets.join(", ")} where id = $${params.length} returning *`,
      params
    )
    return row ? rowToQuestion(row, true) : null
  }

  async delete(id: string): Promise<void> {
    await pool.query(`delete from questions where id = $1`, [id])
  }
}
