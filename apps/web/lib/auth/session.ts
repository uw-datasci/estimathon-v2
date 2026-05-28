import "server-only"

import { redirect } from "next/navigation"
import { clientConfig } from "@/config/client"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AuthenticatedUser } from "@estimathon/types"

/**
 * Returns the access token of the current session, or null if no valid
 * session is present. Use this in route handlers when proxying to the
 * Fastify API.
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/**
 * Returns the authenticated user, or null. Calls `auth.getUser()` (which
 * revalidates the token server-side) instead of relying on the local
 * session, so we don't trust a stale cookie.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  const role =
    (data.user.app_metadata?.role as string | undefined) === "admin"
      ? "admin"
      : "user"
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role,
  }
}

/**
 * Server-side guard: redirects to the main club site's login page when no
 * session is present. Returns the authenticated user on success.
 */
export async function requireSession(
  returnTo?: string
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()
  if (!user) {
    const loginUrl = new URL("/login", clientConfig.mainSiteUrl)
    if (returnTo) loginUrl.searchParams.set("redirect", returnTo)
    redirect(loginUrl.toString())
  }
  return user
}

/**
 * Like requireSession but additionally requires `app_metadata.role = admin`.
 * Redirects to /unauthorized for non-admins.
 */
export async function requireAdmin(returnTo?: string): Promise<AuthenticatedUser> {
  const user = await requireSession(returnTo)
  if (user.role !== "admin") redirect("/unauthorized")
  return user
}
