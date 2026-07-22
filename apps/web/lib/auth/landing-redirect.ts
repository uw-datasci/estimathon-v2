import { redirect } from "next/navigation";
import type { EventStatus, MeResponse } from "@estimathon/types";

export function redirectAuthenticatedUserFromLanding(me: MeResponse | null | undefined): void {
  const event = me?.event;
  if (!event) return;

  const path = landingPathForEvent(event.status, Boolean(me?.team));
  if (path) redirect(path);
}

function landingPathForEvent(status: EventStatus, hasTeam: boolean): string | null {
  switch (status) {
    case "active":
      return hasTeam ? "/play" : "/onboarding";
    case "ended":
      return "/results";
    case "draft":
    case "archived":
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
