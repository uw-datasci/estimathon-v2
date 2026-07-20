import type { FastifySchema } from "fastify"

const eventSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    startsAt: { type: "string" },
    durationMinutes: { type: "integer" },
    endsAt: { type: "string" },
    teamSizeCap: { type: "integer" },
    submissionCap: { type: "integer" },
    questionCount: { type: "integer" },
    status: { type: "string" },
    createdAt: { type: "string" },
  },
} as const

const teamSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    eventId: { type: "string" },
    code: { type: "string" },
    name: { type: ["string", "null"] },
    createdAt: { type: "string" },
  },
} as const

export const meSchema = {
  get: {
    tags: ["me"],
    summary: "Current user, team, and active event",
    response: {
      200: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: ["string", "null"] },
              role: { type: "string", enum: ["admin", "exec", "user"] },
            },
          },
          team: { ...teamSchema, nullable: true },
          event: { ...eventSchema, nullable: true },
        },
      },
      401: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
} satisfies Record<string, FastifySchema>
