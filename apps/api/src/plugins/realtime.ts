import type { FastifyInstance } from "fastify";
import { EventHub } from "../modules/realtime/event-hub";
import { EditingPresenceStore } from "../modules/realtime/editing-presence";

export async function registerRealtime(fastify: FastifyInstance) {
  const hub = new EventHub();
  fastify.decorate("eventHub", hub);

  const editingPresence = new EditingPresenceStore(hub);
  fastify.decorate("editingPresence", editingPresence);
  fastify.addHook("onClose", async () => editingPresence.dispose());
}
