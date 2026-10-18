import type { FastifyReply, FastifyRequest } from "fastify";
import { EventsService } from "./events.service";
import { handle } from "../../utils/http";
import type { CreateEventInput, UpdateEventInput } from "./events.types";

export class EventsController {
  constructor(private readonly service: EventsService) {
    this.getActive = this.getActive.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async getActive(_request: FastifyRequest, reply: FastifyReply) {
    return handle(reply, async () => {
      const event = await this.service.getActive();
      return { event };
    });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, () => this.service.getById(id));
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    return handle(reply, async () => {
      const events = await this.service.list();
      return { events };
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateEventInput;
    return handle(reply, () => this.service.create(body), 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateEventInput;
    return handle(reply, () => this.service.update(id, body));
  }

  async start(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { startsAt } = request.body as { startsAt: string };
    return handle(reply, () => this.service.start(id, startsAt));
  }

  async pause(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, () => this.service.pause(id));
  }

  async resume(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, () => this.service.resume(id));
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, () => this.service.getStats(id));
  }
}
