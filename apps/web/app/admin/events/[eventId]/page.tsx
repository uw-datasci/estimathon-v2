import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@estimathon/ui/components/button"
import { Badge } from "@estimathon/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"
import { AdminShell } from "@/components/admin/admin-shell"
import { EventForm } from "@/components/admin/event-form"
import { EventLifecycleActions } from "@/components/admin/event-lifecycle-actions"
import { proxyApiJson } from "@/lib/api/proxy"
import { formatRange, statusVariant } from "@/lib/format/event"
import type { Event, Question } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const [eventResult, questionsResult] = await Promise.all([
    proxyApiJson<Event>(`/events/${encodeURIComponent(eventId)}`),
    proxyApiJson<{ questions: Question[] }>(
      `/admin/events/${encodeURIComponent(eventId)}/questions`
    ),
  ])
  if (eventResult.status === 404 || !eventResult.data) notFound()
  const event = eventResult.data
  const questionsCount = questionsResult.data?.questions.length ?? 0

  return (
    <AdminShell
      title={event.name}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(event.status)}>{event.status}</Badge>
          <EventLifecycleActions event={event} questionsCount={questionsCount} />
        </div>
      }
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide">Window</dt>
                <dd className="text-foreground">
                  {formatRange(event.startsAt, event.endsAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Questions</dt>
                <dd className="text-foreground">
                  {questionsCount}/{event.submissionCap}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Team cap</dt>
                <dd className="text-foreground">{event.teamSizeCap}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">
                  Submissions cap
                </dt>
                <dd className="text-foreground">{event.submissionCap}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/events/${event.id}/questions`}>Questions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/events/${event.id}/teams`}>Teams</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/events/${event.id}/live`}>Live monitor</Link>
          </Button>
        </div>

        <EventForm mode="edit" initial={event} />
      </div>
    </AdminShell>
  )
}
