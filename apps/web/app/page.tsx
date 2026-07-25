import { Backdrop } from "@/components/marketing/backdrop";
import { LandingHero } from "@/components/marketing/landing-hero";
import { proxyApiJson } from "@/lib/api/proxy";
import { redirectFromLanding } from "@/lib/auth/landing-redirect";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { Event, MeResponse } from "@estimathon/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getAuthenticatedUser();
  const activeResult = await proxyApiJson<{ event: Event | null }>("/events/active");
  const event = activeResult.data?.event ?? null;

  if (user) {
    const me = await proxyApiJson<MeResponse>("/me");
    redirectFromLanding(me.data);
  }

  return (
    <>
      <Backdrop />
      <LandingHero event={event} />
    </>
  );
}
