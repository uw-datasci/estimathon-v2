"use client"

// TODO: remove this page - temporary manual test harness for the raft
// integration (see /api/raft-test/route.ts, also temporary).

import { useState } from "react"
import { Button } from "@estimathon/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"

interface TestCase {
  key: string
  label: string
  query: string
  manualRedirect?: boolean
}

const CASES: TestCase[] = [
  { key: "ok", label: "200 OK", query: "type=ok" },
  { key: "badRequest", label: "400 Bad Request", query: "type=badRequest" },
  { key: "unauthorized", label: "401 Unauthorized", query: "type=unauthorized" },
  { key: "forbidden", label: "403 Forbidden", query: "type=forbidden" },
  { key: "notFound", label: "404 Not Found", query: "type=notFound" },
  { key: "json", label: "502 via RaftResponse.json", query: "type=json" },
  { key: "text", label: "200 via RaftResponse.text (CSV)", query: "type=text" },
  {
    key: "throw",
    label: "Unhandled throw -> 500 + quarantine (error)",
    query: "type=throw",
  },
  {
    key: "apiError",
    label: "ApiError throw -> 500 + quarantine (still 500, not 422)",
    query: "type=apiError",
  },
  {
    key: "redirect",
    label: "redirect() control-flow passthrough",
    query: "type=redirect",
    manualRedirect: true,
  },
  {
    key: "manual-debug",
    label: "Manual report - severity: debug",
    query: "type=manual&severity=debug",
  },
  {
    key: "manual-info",
    label: "Manual report - severity: info",
    query: "type=manual&severity=info",
  },
  {
    key: "manual-warning",
    label: "Manual report - severity: warning",
    query: "type=manual&severity=warning",
  },
  {
    key: "manual-error",
    label: "Manual report - severity: error",
    query: "type=manual&severity=error",
  },
  {
    key: "manual-fatal",
    label: "Manual report - severity: fatal",
    query: "type=manual&severity=fatal",
  },
]

interface Result {
  key: string
  status: number
  body: string
}

export default function RaftTestPage() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  async function run(c: (typeof CASES)[number]) {
    setLoading(c.key)
    try {
      const res = await fetch(`/api/raft-test?${c.query}`, {
        // Redirects would otherwise be followed transparently by fetch;
        // "manual" surfaces the raw 307 so we can confirm withRaft let the
        // Next.js control-flow signal through instead of quarantining it.
        redirect: c.manualRedirect ? "manual" : "follow",
      })
      const body = c.manualRedirect
        ? `(opaqueredirect - type: ${res.type}, status: ${res.status || "0 (opaque)"})`
        : await res.text()
      setResults((prev) => [
        { key: c.key, status: res.status, body },
        ...prev,
      ])
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Raft test harness</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CASES.map((c) => (
            <Button
              key={c.key}
              variant="outline"
              size="sm"
              disabled={loading === c.key}
              onClick={() => run(c)}
            >
              {loading === c.key ? "Running..." : c.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Click a button above to trigger a request.
            </p>
          )}
          {results.map((r, i) => (
            <pre
              key={i}
              className="bg-muted overflow-x-auto rounded-md p-3 text-xs"
            >
              {r.key} -&gt; {r.status}
              {"\n"}
              {r.body}
            </pre>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
