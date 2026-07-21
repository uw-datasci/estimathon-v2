"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { clientConfig } from "@/config/client"
import type { LeaderboardEntry, ServerMessage } from "@estimathon/types"

export const leaderboardQueryKey = (eventId: string) =>
  ["leaderboard", eventId] as const

interface UseEventStreamOptions {
  eventId: string | null
  accessToken: string | null
  teamId?: string | null
  onTeamScore?: (score: {
    teamId: string
    score: number
    goodIntervals: number
    submissionCount: number
  }) => void
  onEventStatus?: (status: ServerMessage & { type: "event_status" }) => void
  onSubmission?: (msg: ServerMessage & { type: "submission" }) => void
  onEditing?: (msg: ServerMessage & { type: "editing" }) => void
}

/**
 * Opens an SSE connection to Fastify and merges messages into TanStack Query.
 * EventSource cannot send Authorization headers, so we pass access_token in the query.
 */
export function useEventStream({
  eventId,
  accessToken,
  teamId,
  onTeamScore,
  onEventStatus,
  onSubmission,
  onEditing,
}: UseEventStreamOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!eventId || !accessToken) return

    const url = new URL(
      `/events/${encodeURIComponent(eventId)}/stream`,
      clientConfig.apiUrl
    )
    url.searchParams.set("access_token", accessToken)

    const es = new EventSource(url.toString(), { withCredentials: true })

    es.onmessage = (ev) => {
      let msg: ServerMessage
      try {
        msg = JSON.parse(ev.data) as ServerMessage
      } catch {
        return
      }

      switch (msg.type) {
        case "leaderboard":
          queryClient.setQueryData(leaderboardQueryKey(eventId), msg.data)
          break
        case "team_score":
          if (teamId && msg.teamId === teamId) {
            const payload = {
              teamId: msg.teamId,
              score: msg.score,
              goodIntervals: msg.goodIntervals,
              submissionCount: msg.submissionCount,
            }
            queryClient.setQueryData(["teamScore", teamId], payload)
            onTeamScore?.(payload)
          }
          break
        case "event_status":
          onEventStatus?.(msg)
          break
        case "submission":
          onSubmission?.(msg)
          break
        case "editing":
          if (!teamId || msg.teamId === teamId) onEditing?.(msg)
          break
        default:
          break
      }
    }

    return () => es.close()
  }, [
    eventId,
    accessToken,
    teamId,
    queryClient,
    onTeamScore,
    onEventStatus,
    onSubmission,
    onEditing,
  ])
}

/**
 * Tells the server the caller has started/stopped editing a question, so
 * teammates can see a live "X is answering" indicator. Fire-and-forget -
 * presence is best-effort and self-heals via server-side TTL expiry.
 */
export function postEditingPresence(
  eventId: string,
  teamId: string,
  questionId: string,
  editing: boolean,
  identity: { name: string; avatarUrl: string | null }
) {
  const body = JSON.stringify({
    teamId,
    questionId,
    editing,
    name: identity.name,
    avatarUrl: identity.avatarUrl,
  })
  fetch(`/api/events/${encodeURIComponent(eventId)}/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: !editing,
  }).catch(() => {
    // best-effort - a dropped call just means the outline disappears a
    // little later than ideal, or the sweep on the server clears it
  })
}

export function useLeaderboardQuery(
  eventId: string,
  initial: LeaderboardEntry[]
) {
  const queryClient = useQueryClient()
  return {
    data:
      queryClient.getQueryData<LeaderboardEntry[]>(
        leaderboardQueryKey(eventId)
      ) ?? initial,
  }
}
