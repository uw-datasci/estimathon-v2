import { withRaft, RaftResponse, ApiError, RaftClient } from "@uw-datasci/raft"
import type { RaftSeverity } from "@uw-datasci/raft"
import { redirect } from "next/navigation"

// TODO: remove this route - temporary manual test harness for the raft
// integration (see /raft-test/page.tsx, also temporary).
/**
 * Usage: GET /api/raft-test?type=<...>[&severity=<debug|info|warning|error|fatal>]
 *
 * types: ok | badRequest | unauthorized | forbidden | notFound | json | text
 *        | throw | apiError | redirect | manual
 */
export const GET = withRaft(async (request) => {
  const url = new URL(request.url)
  const type = url.searchParams.get("type") ?? "throw"
  const severity = (url.searchParams.get("severity") ?? "error") as RaftSeverity

  switch (type) {
    case "ok":
      return RaftResponse.ok({ message: "success" })

    case "badRequest":
      return RaftResponse.badRequest("id is required", "Bad Request")

    case "unauthorized":
      return RaftResponse.unauthorized()

    case "forbidden":
      return RaftResponse.forbidden("Execs only")

    case "notFound":
      return RaftResponse.notFound("Widget not found")

    case "json":
      // Custom status code passthrough - what /me uses for upstream errors.
      return RaftResponse.json({ error: "Upstream error" }, 502)

    case "text":
      // Non-JSON body - what forward() uses for every proxied route.
      return RaftResponse.text("id,name\n1,test", "text/csv", 200)

    case "throw":
      // Unhandled error -> withRaft catches it -> quarantine + clean 500.
      throw new Error("Forced test error: unhandled throw")

    case "apiError":
      // Note: withRaft always returns 500 for ANY thrown error - it does NOT
      // read ApiError.statusCode/code to pick the HTTP status. Those fields
      // are stored as context only.
      throw new ApiError("Forced test error: ApiError", 422, "TEST_CODE")

    case "redirect":
      // Next.js control-flow signal - withRaft must re-throw this untouched
      // (never quarantine it as an application error). Fetch with
      // redirect: "manual" client-side to observe the raw 307 rather than
      // following it.
      return redirect("/raft-test?redirected=1")

    case "manual":
      // Bypasses withRaft's catch entirely - reports directly at the chosen
      // severity, without returning a 500.
      await RaftClient.getInstance().reportError(
        new Error(`Forced test error: manual report (${severity})`),
        { route: "/api/raft-test", method: "GET" },
        severity
      )
      return RaftResponse.ok({ message: `manually reported at ${severity}` })

    default:
      return RaftResponse.badRequest(`Unknown type: ${type}`)
  }
})
