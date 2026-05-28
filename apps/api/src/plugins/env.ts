/**
 * Environment configuration via `@fastify/env`.
 *
 * Loads variables from `.env` (when present) and validates them against a JSON
 * schema. Exposes the result on `fastify.config`.
 */
import type { FastifyInstance } from "fastify"
import fastifyEnv from "@fastify/env"

const schema = {
  type: "object",
  properties: {
    NODE_ENV: { type: "string", default: "development" },
    PORT: { type: "string", default: "8000" },
    HOST: { type: "string", default: "localhost" },
    CORS_ORIGIN: { type: "string", default: "" },
    SUPABASE_URL: { type: "string", default: "" },
  },
} as const

export async function registerEnv(fastify: FastifyInstance) {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema,
    dotenv: true,
  })
}
