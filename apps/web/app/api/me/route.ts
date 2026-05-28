import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/session"
import { getProfile } from "@/lib/auth/profile"
import { proxyApiJson } from "@/lib/api/proxy"
import type { MeResponse } from "@estimathon/types"

interface FastifyMeResponse {
  user: MeResponse["user"]
  team: MeResponse["team"]
  event: MeResponse["event"]
}

/**
 * Combined /me endpoint: returns user (Supabase auth), profile (Supabase
 * profiles table), and team + event (Fastify -> Neon). The single round
 * trip simplifies the client.
 */
export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const [profile, apiResult] = await Promise.all([
    getProfile(user.id),
    proxyApiJson<FastifyMeResponse>("/me"),
  ])

  if (apiResult.status === 401) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }
  if (!apiResult.data) {
    return NextResponse.json(
      { error: apiResult.error ?? "Upstream error" },
      { status: apiResult.status || 502 }
    )
  }

  const response: MeResponse = {
    user,
    profile,
    team: apiResult.data.team,
    event: apiResult.data.event,
  }
  return NextResponse.json(response)
}
