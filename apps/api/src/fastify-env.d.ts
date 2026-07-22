import "fastify";
import type { AuthenticatedUser } from "@estimathon/types";
import type { EventHub } from "./modules/realtime/event-hub";
import type { EditingPresenceStore } from "./modules/realtime/editing-presence";

declare module "fastify" {
  interface FastifyInstance {
    eventHub: EventHub;
    editingPresence: EditingPresenceStore;
    config: {
      NODE_ENV: string;
      PORT: string;
      HOST: string;
      CORS_ORIGIN: string;
      SUPABASE_URL: string;
    };
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
