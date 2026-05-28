import type { Question } from "@estimathon/types"
import { HttpError } from "../events/events.service"
import { EventsRepository } from "../events/events.repository"
import type { EventHub } from "../realtime/event-hub"
import { QuestionsRepository } from "./questions.repository"
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "./questions.types"

export class QuestionsService {
  constructor(
    private readonly repository: QuestionsRepository,
    private readonly events: EventsRepository,
    private readonly hub?: EventHub
  ) {}

  /**
   * Player-visible list: released only, answer stripped.
   */
  async listReleased(eventId: string): Promise<Question[]> {
    return this.repository.listForEvent(eventId, {
      releasedOnly: true,
      includeAnswer: false,
    })
  }

  /**
   * Admin list: all questions, with answers.
   */
  async listAll(eventId: string): Promise<Question[]> {
    return this.repository.listForEvent(eventId, {
      releasedOnly: false,
      includeAnswer: true,
    })
  }

  async create(eventId: string, input: CreateQuestionInput): Promise<Question> {
    const event = await this.events.findById(eventId)
    if (!event) throw new HttpError(404, "Event not found")
    if (!input.prompt?.trim()) throw new HttpError(400, "Prompt is required")
    if (!Number.isFinite(input.answer))
      throw new HttpError(400, "Answer must be a number")
    const position =
      input.position ?? (await this.repository.nextPosition(eventId))
    return this.repository.create({
      eventId,
      position,
      prompt: input.prompt.trim(),
      answer: input.answer,
    })
  }

  async update(id: string, input: UpdateQuestionInput): Promise<Question> {
    let releasedAt: string | null | undefined
    if (input.released === undefined) {
      releasedAt = undefined
    } else if (input.released) {
      releasedAt = new Date().toISOString()
    } else {
      releasedAt = null
    }

    const updated = await this.repository.update(id, {
      prompt: input.prompt?.trim(),
      answer: input.answer,
      position: input.position,
      releasedAt,
    })
    if (!updated) throw new HttpError(404, "Question not found")
    if (input.released === true && updated.releasedAt) {
      this.hub?.publish(updated.eventId, {
        type: "question_released",
        eventId: updated.eventId,
        questionId: updated.id,
        position: updated.position,
      })
    }
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
