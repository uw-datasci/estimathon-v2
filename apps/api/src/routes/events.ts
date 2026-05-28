import type { FastifyPluginAsync } from "fastify"

import { EventsController } from "../modules/events/events.controller"
import { EventsRepository } from "../modules/events/events.repository"
import { eventsSchema } from "../modules/events/events.schema"
import { EventsService } from "../modules/events/events.service"

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  const repository = new EventsRepository()
  const service = new EventsService(repository, fastify.eventHub)
  const controller = new EventsController(service)

  // Public - used by the marketing landing page for the countdown.
  fastify.get(
    "/events/active",
    { schema: eventsSchema.getActive },
    controller.getActive
  )
  fastify.get(
    "/events/:id",
    { schema: eventsSchema.getById, preHandler: fastify.requireAuth },
    controller.getById
  )

  // Admin
  fastify.get(
    "/admin/events",
    { schema: eventsSchema.list, preHandler: fastify.requireAdmin },
    controller.list
  )
  fastify.post(
    "/admin/events",
    { schema: eventsSchema.create, preHandler: fastify.requireAdmin },
    controller.create
  )
  fastify.patch(
    "/admin/events/:id",
    { schema: eventsSchema.update, preHandler: fastify.requireAdmin },
    controller.update
  )
}

export default eventsRoutes
