import type { FastifyPluginAsync } from "fastify";

import { EventsController } from "../modules/events/events.controller";
import { EventsRepository } from "../modules/events/events.repository";
import { eventsSchema } from "../modules/events/events.schema";
import { EventsService } from "../modules/events/events.service";
import { QuestionsRepository } from "../modules/questions/questions.repository";

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  const repository = new EventsRepository();
  const questionsRepository = new QuestionsRepository();
  const service = new EventsService(repository, fastify.eventHub, questionsRepository);
  const controller = new EventsController(service);

  // Public - used by the marketing landing page for the countdown.
  fastify.get("/events/active", { schema: eventsSchema.getActive }, controller.getActive);
  fastify.get(
    "/events/:id",
    { schema: eventsSchema.getById, preHandler: fastify.requireAuth },
    controller.getById
  );

  // Admin
  fastify.get(
    "/admin/events",
    { schema: eventsSchema.list, preHandler: fastify.requireAdmin },
    controller.list
  );
  fastify.post(
    "/admin/events",
    { schema: eventsSchema.create, preHandler: fastify.requireAdmin },
    controller.create
  );
  fastify.patch(
    "/admin/events/:id",
    { schema: eventsSchema.update, preHandler: fastify.requireAdmin },
    controller.update
  );
  fastify.post(
    "/admin/events/:id/start",
    { schema: eventsSchema.start, preHandler: fastify.requireAdmin },
    controller.start
  );
  fastify.post(
    "/admin/events/:id/pause",
    { schema: eventsSchema.pause, preHandler: fastify.requireAdmin },
    controller.pause
  );
  fastify.post(
    "/admin/events/:id/resume",
    { schema: eventsSchema.resume, preHandler: fastify.requireAdmin },
    controller.resume
  );
  fastify.post(
    "/admin/events/:id/add-time",
    { schema: eventsSchema.addTime, preHandler: fastify.requireAdmin },
    controller.addTime
  );
};

export default eventsRoutes;
