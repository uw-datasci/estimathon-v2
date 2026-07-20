import "server-only"

import { RaftResponse } from "@uw-datasci/raft"
import type { NextResponse } from "next/server"
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
  const headers: Record<string, string> = {}
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text()
    if (text) {
      body = text
      headers["Content-Type"] =
        request.headers.get("content-type") ?? "application/json"
    }
  }

  const upstream = await proxyApi(fullPath, {
    method: request.method,
    body,
    headers,
  })

  const text = await upstream.text()
  return RaftResponse.text(text, "application/json", upstream.status)
}
