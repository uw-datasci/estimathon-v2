import type { EventStatus } from "@estimathon/types"

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function formatRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return `${dateFormatter.format(start)} → ${dateFormatter.format(end)}`
}

export function statusVariant(
  status: EventStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "ended":
    case "archived":
    case "draft":
      return "outline"
  }
}

/**
 * Convert an ISO string to the value format `<input type="datetime-local">`
 * expects (YYYY-MM-DDTHH:mm in the user's local timezone).
 */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

/**
 * Convert a `datetime-local` value (local timezone) back to ISO UTC.
 */
export function fromLocalInput(local: string): string {
  return new Date(local).toISOString()
}
