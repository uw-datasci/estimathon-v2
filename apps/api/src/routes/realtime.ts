import type { FastifyPluginAsync } from "fastify";

import { RealtimeController } from "../modules/realtime/realtime.controller";
import { realtimeSchema } from "../modules/realtime/realtime.schema";
import { TeamsRepository } from "../modules/teams/teams.repository";

const realtimeRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new RealtimeController(
    fastify.eventHub,
    fastify.editingPresence,
    new TeamsRepository()
  );

  fastify.get(
    "/events/:id/stream",
    { schema: realtimeSchema.stream, preHandler: fastify.requireAuth },
    controller.stream
  );
  fastify.post(
    "/events/:id/presence",
    { schema: realtimeSchema.setEditing, preHandler: fastify.requireAuth },
    controller.setEditing
  );
};

export default realtimeRoutes;
