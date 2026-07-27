/**
 * Request rate limiting via `@fastify/rate-limit`.
 *
 * Keys on the authenticated user (set by the auth plugin's `onRequest` hook,
 * which must be registered before this plugin - see `plugins/index.ts`),
 * falling back to IP for unauthenticated requests. Per-user keying means one
 * chatty client can't drain a budget shared by everyone else - notably the
 * host, who needs to be able to pause/resume even while players are mid-game.
 *
 * `/health` and the SSE stream are exempt: `/health` for liveness probes, and
 * the stream because a 429 on that GET is read by `EventSource` as an error,
 * which triggers an auto-reconnect a few seconds later into the same
 * exhausted bucket - a feedback loop that can take the whole event down. The
 * cost of SSE is the held-open connection, not the request count.
 */
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyRequest } from "fastify";

function pathOnly(url: string): string {
  const q = url.indexOf("?");
  return q === -1 ? url : url.slice(0, q);
}

const RATE_LIMIT_SKIP_PATHS = new Set(["/health"]);
const SSE_STREAM_PATH = /^\/events\/[^/]+\/stream$/;

function isExempt(req: FastifyRequest): boolean {
  const path = pathOnly(req.url);
  return RATE_LIMIT_SKIP_PATHS.has(path) || SSE_STREAM_PATH.test(path);
}

export async function registerRateLimit(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 200, // Per-user requests per minute
    timeWindow: "1 minute",
    keyGenerator: (req: FastifyRequest) => req.user?.id ?? req.ip,
    allowList: isExempt,
  });
}
