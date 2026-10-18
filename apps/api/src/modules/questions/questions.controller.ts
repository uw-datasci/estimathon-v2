import type { FastifyReply, FastifyRequest } from "fastify";
import { QuestionsService } from "./questions.service";
import { handle } from "../../utils/http";
import type { CreateQuestionInput, UpdateQuestionInput } from "./questions.types";

export class QuestionsController {
  constructor(private readonly service: QuestionsService) {
    this.listForPlayers = this.listForPlayers.bind(this);
    this.listAll = this.listAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async listForPlayers(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, async () => {
      const questions = await this.service.listForPlayers(id);
      return { questions };
    });
  }

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, async () => {
      const questions = await this.service.listAll(id);
      return { questions };
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as CreateQuestionInput;
    return handle(reply, () => this.service.create(id, body), 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateQuestionInput;
    return handle(reply, () => this.service.update(id, body));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, async () => {
      await this.service.delete(id);
      return { ok: true };
    });
  }
}
