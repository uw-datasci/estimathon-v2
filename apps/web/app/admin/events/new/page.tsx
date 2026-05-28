import { AdminShell } from "@/components/admin/admin-shell"
import { EventForm } from "@/components/admin/event-form"

export default function NewEventPage() {
  return (
    <AdminShell title="New event">
      <EventForm mode="create" />
    </AdminShell>
  )
}
