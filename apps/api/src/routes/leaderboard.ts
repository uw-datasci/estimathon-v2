import type { FastifyPluginAsync } from "fastify";

import { EventsRepository } from "../modules/events/events.repository";
import { LeaderboardController } from "../modules/leaderboard/leaderboard.controller";
import { LeaderboardService } from "../modules/leaderboard/leaderboard.service";
import { leaderboardSchema } from "../modules/leaderboard/leaderboard.schema";
import { QuestionsRepository } from "../modules/questions/questions.repository";
import { SubmissionsRepository } from "../modules/submissions/submissions.repository";
import { TeamsRepository } from "../modules/teams/teams.repository";

const leaderboardRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new LeaderboardService(
    new TeamsRepository(),
    new SubmissionsRepository(),
    new QuestionsRepository(),
    new EventsRepository(),
    fastify.eventHub
  );
  const controller = new LeaderboardController(service);

  fastify.get(
    "/events/:id/leaderboard",
    {
      schema: leaderboardSchema.getForEvent,
      preHandler: fastify.requireAuth,
    },
    controller.getForEvent
  );
};

export default leaderboardRoutes;
