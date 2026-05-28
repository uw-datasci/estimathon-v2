import type { FastifyPluginAsync } from "fastify"

import { EventsRepository } from "../modules/events/events.repository"
import { QuestionsController } from "../modules/questions/questions.controller"
import { QuestionsRepository } from "../modules/questions/questions.repository"
import { questionsSchema } from "../modules/questions/questions.schema"
import { QuestionsService } from "../modules/questions/questions.service"

const questionsRoutes: FastifyPluginAsync = async (fastify) => {
  const questionsRepo = new QuestionsRepository()
  const eventsRepo = new EventsRepository()
  const service = new QuestionsService(
    questionsRepo,
    eventsRepo,
    fastify.eventHub
  )
  const controller = new QuestionsController(service)

  // Player
  fastify.get(
    "/events/:id/questions",
    { schema: questionsSchema.listReleased, preHandler: fastify.requireAuth },
    controller.listReleased
  )

  // Admin
  fastify.get(
    "/admin/events/:id/questions",
    { schema: questionsSchema.listAll, preHandler: fastify.requireAdmin },
    controller.listAll
  )
  fastify.post(
    "/admin/events/:id/questions",
    { schema: questionsSchema.create, preHandler: fastify.requireAdmin },
    controller.create
  )
  fastify.patch(
    "/admin/questions/:id",
    { schema: questionsSchema.update, preHandler: fastify.requireAdmin },
    controller.update
  )
  fastify.delete(
    "/admin/questions/:id",
    { schema: questionsSchema.delete, preHandler: fastify.requireAdmin },
    controller.delete
  )
}

export default questionsRoutes
