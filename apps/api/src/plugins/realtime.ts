import type { FastifyInstance } from "fastify"
import { EventHub } from "../modules/realtime/event-hub"

export async function registerRealtime(fastify: FastifyInstance) {
  const hub = new EventHub()
  fastify.decorate("eventHub", hub)
}
