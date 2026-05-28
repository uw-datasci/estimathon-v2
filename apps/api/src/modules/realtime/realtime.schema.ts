import type { FastifySchema } from "fastify"

export const realtimeSchema = {
  stream: {
    tags: ["realtime"],
    summary: "SSE stream for live event updates",
    params: { type: "object", properties: { id: { type: "string" } } },
  },
} satisfies Record<string, FastifySchema>
