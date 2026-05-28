import type { FastifySchema } from "fastify"

const eventStatusEnum = ["draft", "active", "ended", "archived"]

const eventProps = {
  id: { type: "string" },
  name: { type: "string" },
  startsAt: { type: "string" },
  durationMinutes: { type: "integer" },
  endsAt: { type: "string" },
  teamSizeCap: { type: "integer" },
  submissionCap: { type: "integer" },
  questionCount: { type: "integer" },
  status: { type: "string", enum: eventStatusEnum },
  createdAt: { type: "string" },
} as const

const eventObject = { type: "object", properties: eventProps } as const

const createBody = {
  type: "object",
  required: ["name", "startsAt", "durationMinutes"],
  properties: {
    name: { type: "string" },
    startsAt: { type: "string" },
    durationMinutes: { type: "integer", minimum: 1 },
    teamSizeCap: { type: "integer", minimum: 1 },
    submissionCap: { type: "integer", minimum: 1 },
    questionCount: { type: "integer", minimum: 1 },
    status: { type: "string", enum: eventStatusEnum },
  },
} as const

const updateBody = {
  type: "object",
  properties: {
    name: { type: "string" },
    startsAt: { type: "string" },
    durationMinutes: { type: "integer", minimum: 1 },
    teamSizeCap: { type: "integer", minimum: 1 },
    submissionCap: { type: "integer", minimum: 1 },
    questionCount: { type: "integer", minimum: 1 },
    status: { type: "string", enum: eventStatusEnum },
  },
} as const

export const eventsSchema = {
  getActive: {
    tags: ["events"],
    summary: "Latest active or recently ended event",
    response: {
      200: {
        type: "object",
        properties: { event: { ...eventObject, nullable: true } },
      },
    },
  },
  getById: {
    tags: ["events"],
    summary: "Get event by id",
    params: { type: "object", properties: { id: { type: "string" } } },
    response: { 200: eventObject },
  },
  list: {
    tags: ["events"],
    summary: "List all events",
    response: {
      200: {
        type: "object",
        properties: { events: { type: "array", items: eventObject } },
      },
    },
  },
  create: {
    tags: ["events", "admin"],
    summary: "Create an event",
    body: createBody,
    response: { 201: eventObject },
  },
  update: {
    tags: ["events", "admin"],
    summary: "Update an event",
    params: { type: "object", properties: { id: { type: "string" } } },
    body: updateBody,
    response: { 200: eventObject },
  },
} satisfies Record<string, FastifySchema>
