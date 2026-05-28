import "server-only"

import { NextResponse } from "next/server"
import { proxyApi } from "./proxy"

/**
 * Generic gateway helper: forward an incoming request to the Fastify API at
 * the given path. Carries forward the body, query, and method; attaches the
 * current Supabase access token as Bearer auth. Returns a NextResponse with
 * the upstream status + body.
 */
export async function forward(
  request: Request,
  path: string
): Promise<NextResponse> {
  const url = new URL(request.url)
  const fullPath = path + (url.search || "")

  let body: BodyInit | undefined = undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text()
  }

  const upstream = await proxyApi(fullPath, {
    method: request.method,
    body,
    headers: { "Content-Type": "application/json" },
  })

  const text = await upstream.text()
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
