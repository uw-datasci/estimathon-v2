import type { FastifyReply, FastifyRequest } from "fastify"
import type { EventHub } from "./event-hub"

export class RealtimeController {
  constructor(private readonly hub: EventHub) {
    this.stream = this.stream.bind(this)
  }

  async stream(request: FastifyRequest, reply: FastifyReply) {
    const { id: eventId } = request.params as { id: string }
    if (!request.user) {
      return reply.code(401).send({ error: "Unauthenticated" })
    }

    reply.hijack()
    reply.raw.setHeader("Content-Type", "text/event-stream")
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform")
    reply.raw.setHeader("Connection", "keep-alive")
    reply.raw.setHeader("X-Accel-Buffering", "no")
    reply.raw.flushHeaders()

    this.hub.subscribe(eventId, reply)
  }
}
