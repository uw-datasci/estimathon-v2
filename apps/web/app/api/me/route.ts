import { withRaft, RaftResponse } from "@uw-datasci/raft";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/auth/profile";
import { proxyApiJson } from "@/lib/api/proxy";
import type { MeResponse } from "@estimathon/types";

interface FastifyMeResponse {
  user: MeResponse["user"];
  team: MeResponse["team"];
  event: MeResponse["event"];
}

/**
 * Combined /me endpoint: returns user (Supabase auth), profile (Supabase
 * profiles table), and team + event (Fastify -> Neon). The single round
 * trip simplifies the client.
 */
export const GET = withRaft(async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return RaftResponse.unauthorized(undefined, "Unauthenticated");
  }

  const [profile, apiResult] = await Promise.all([
    getProfile(user.id),
    proxyApiJson<FastifyMeResponse>("/me"),
  ]);

  if (apiResult.status === 401) {
    return RaftResponse.unauthorized(undefined, "Unauthenticated");
  }
  if (!apiResult.data) {
    return RaftResponse.json(
      { error: apiResult.error ?? "Upstream error" },
      apiResult.status || 502
    );
  }

  const response: MeResponse = {
    user,
    profile,
    team: apiResult.data.team,
    event: apiResult.data.event,
  };
  return RaftResponse.ok(response);
});
