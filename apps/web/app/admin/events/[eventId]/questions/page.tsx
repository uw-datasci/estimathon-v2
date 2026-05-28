import { notFound } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"
import { QuestionsEditor } from "@/components/admin/questions-editor"
import { proxyApiJson } from "@/lib/api/proxy"
import type { Event, Question } from "@estimathon/types"

export const dynamic = "force-dynamic"

export default async function EventQuestionsPage({
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
  const questions = questionsResult.data?.questions ?? []

  return (
    <AdminShell
      title={`${event.name} - Questions`}
      actions={
        <Link
          href={`/admin/events/${event.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Event overview
        </Link>
      }
    >
      <QuestionsEditor eventId={event.id} questions={questions} />
    </AdminShell>
  )
}
