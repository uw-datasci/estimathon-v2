/**
 * Cross-origin resource sharing via `@fastify/cors`.
 *
 * `CORS_ORIGIN` is a single origin matching the web app, e.g.
 * `http://localhost:3002` (local) or `https://estimathon.uwdatascience.ca` (prod).
 */
import cors from "@fastify/cors"
import type { FastifyInstance } from "fastify"

export async function registerCors(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: fastify.config.CORS_ORIGIN,
    credentials: true,
  })
}
