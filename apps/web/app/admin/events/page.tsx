import Link from "next/link"
import { Button } from "@estimathon/ui/components/button"
import { Badge } from "@estimathon/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"
import { Plus } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { proxyApiJson } from "@/lib/api/proxy"
import type { Event } from "@estimathon/types"
import { formatRange, statusVariant } from "@/lib/format/event"

export const dynamic = "force-dynamic"

export default async function EventsListPage() {
  const result = await proxyApiJson<{ events: Event[] }>("/admin/events")
  const events = result.data?.events ?? []

  return (
    <AdminShell
      title="Events"
      actions={
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus />
            New event
          </Link>
        </Button>
      }
    >
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            No events yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="group"
            >
              <Card className="transition-colors group-hover:bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-base">{event.name}</CardTitle>
                  <Badge variant={statusVariant(event.status)}>
                    {event.status}
                  </Badge>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {formatRange(event.startsAt, event.endsAt)}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
