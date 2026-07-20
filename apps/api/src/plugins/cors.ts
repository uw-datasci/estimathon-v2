/**
 * Cross-origin resource sharing via `@fastify/cors`.
 *
 * `CORS_ORIGIN` from config:
 * - Empty or `*` → permissive (`origin: true`, reflect any request `Origin`).
 * - Otherwise → split on commas, trim each segment, use as an explicit allowlist
 *   (must match the browser `Origin` header, e.g. `http://localhost:3000`, not
 *   `localhost:3000` alone).
 */
import cors from "@fastify/cors"
import type { FastifyInstance } from "fastify"

export function resolveCorsOrigin(value: string): boolean | string[] {
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "*") return true
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Whether `origin` is allowed by the configured CORS_ORIGIN policy. */
export function isOriginAllowed(
  origin: string | undefined,
  corsOriginConfig: string
): boolean {
  if (!origin) return false
  const allowed = resolveCorsOrigin(corsOriginConfig)
  return allowed === true || (Array.isArray(allowed) && allowed.includes(origin))
}

export async function registerCors(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: resolveCorsOrigin(fastify.config.CORS_ORIGIN),
    credentials: true,
  })
}
