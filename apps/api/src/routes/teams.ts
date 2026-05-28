import type { FastifyPluginAsync } from "fastify"

import { EventsRepository } from "../modules/events/events.repository"
import { QuestionsRepository } from "../modules/questions/questions.repository"
import { SubmissionsRepository } from "../modules/submissions/submissions.repository"
import { TeamsController } from "../modules/teams/teams.controller"
import { TeamsRepository } from "../modules/teams/teams.repository"
import { teamsSchema } from "../modules/teams/teams.schema"
import { TeamsService } from "../modules/teams/teams.service"

const teamsRoutes: FastifyPluginAsync = async (fastify) => {
  const teamsRepo = new TeamsRepository()
  const eventsRepo = new EventsRepository()
  const service = new TeamsService(
    teamsRepo,
    eventsRepo,
    new SubmissionsRepository(),
    new QuestionsRepository()
  )
  const controller = new TeamsController(service)

  fastify.post(
    "/events/:id/teams",
    { schema: teamsSchema.create, preHandler: fastify.requireAuth },
    controller.create
  )
  fastify.post(
    "/events/:eventId/teams/:code/join",
    { schema: teamsSchema.join, preHandler: fastify.requireAuth },
    controller.join
  )
  fastify.delete(
    "/teams/:id/members/me",
    { schema: teamsSchema.leave, preHandler: fastify.requireAuth },
    controller.leave
  )
  fastify.get(
    "/teams/:id",
    { schema: teamsSchema.getDetail, preHandler: fastify.requireAuth },
    controller.getDetail
  )
  fastify.get(
    "/admin/events/:id/teams",
    {
      schema: teamsSchema.listForEventAdmin,
      preHandler: fastify.requireAdmin,
    },
    controller.listForEventAdmin
  )
}

export default teamsRoutes
