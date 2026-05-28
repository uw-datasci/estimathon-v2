import { LandingHero } from "@/components/marketing/landing-hero"
import { proxyApiJson } from "@/lib/api/proxy"
import { redirectAuthenticatedUserFromLanding } from "@/lib/auth/landing-redirect"
import { buildLoginHref } from "@/lib/auth/login-href"
import { getAuthenticatedUser } from "@/lib/auth/session"
import type { Event, MeResponse } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const user = await getAuthenticatedUser()
  const activeResult = await proxyApiJson<{ event: Event | null }>(
    "/events/active"
  )
  const event = activeResult.data?.event ?? null

  if (user) {
    const me = await proxyApiJson<MeResponse>("/me")
    redirectAuthenticatedUserFromLanding(me.data)
  }

  const loginHref = await buildLoginHref()

  return <LandingHero event={event} isLoggedIn={!!user} loginHref={loginHref} />
}
