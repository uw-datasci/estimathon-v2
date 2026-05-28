import type { FastifyPluginAsync } from "fastify"

import { EventsRepository } from "../modules/events/events.repository"
import { LeaderboardService } from "../modules/leaderboard/leaderboard.service"
import { QuestionsRepository } from "../modules/questions/questions.repository"
import { SubmissionsController } from "../modules/submissions/submissions.controller"
import { SubmissionsRepository } from "../modules/submissions/submissions.repository"
import { submissionsSchema } from "../modules/submissions/submissions.schema"
import { SubmissionsService } from "../modules/submissions/submissions.service"
import { TeamsRepository } from "../modules/teams/teams.repository"

const submissionsRoutes: FastifyPluginAsync = async (fastify) => {
  const submissionsRepo = new SubmissionsRepository()
  const teamsRepo = new TeamsRepository()
  const eventsRepo = new EventsRepository()
  const questionsRepo = new QuestionsRepository()
  const leaderboard = new LeaderboardService(
    teamsRepo,
    submissionsRepo,
    questionsRepo,
    eventsRepo,
    fastify.eventHub
  )
  const service = new SubmissionsService(
    submissionsRepo,
    teamsRepo,
    eventsRepo,
    questionsRepo,
    { hub: fastify.eventHub, leaderboard }
  )
  const controller = new SubmissionsController(service)

  fastify.post(
    "/submissions",
    { schema: submissionsSchema.submit, preHandler: fastify.requireAuth },
    controller.submit
  )
  fastify.get(
    "/teams/:id/submissions",
    { schema: submissionsSchema.listForTeam, preHandler: fastify.requireAuth },
    controller.listForTeam
  )
  fastify.get(
    "/teams/:id/score",
    { schema: submissionsSchema.score, preHandler: fastify.requireAuth },
    controller.score
  )
}

export default submissionsRoutes
