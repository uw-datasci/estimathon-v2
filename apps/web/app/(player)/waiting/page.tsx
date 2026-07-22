import { redirect } from "next/navigation"
import { proxyApiJson } from "@/lib/api/proxy"
import { getAccessToken } from "@/lib/auth/session"
import { WaitingScreen } from "@/components/player/waiting-screen"
import type { MeResponse } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function WaitingPage() {
  const me = await proxyApiJson<MeResponse>("/me")
  if (me.status === 401 || !me.data) redirect("/")

  const { event, team } = me.data
  if (!event) redirect("/")
  if (!team) redirect("/onboarding")
  if (event.status !== "active") redirect("/")
  if (event.startsAt && Date.parse(event.startsAt) <= Date.now())
    redirect("/play")

  const accessToken = await getAccessToken()

  return <WaitingScreen event={event} team={team} accessToken={accessToken} />
}
