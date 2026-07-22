import type { AuthenticatedUser, Profile } from "./user.js";
import type { Event } from "../event/events.js";
import type { Team } from "../event/teams.js";

export interface MeResponse {
  user: AuthenticatedUser;
  profile: Profile | null;
  team: Team | null;
  event: Event | null;
}
