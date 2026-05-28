"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@estimathon/ui/components/button"
import { Input } from "@estimathon/ui/components/input"
import { Label } from "@estimathon/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@estimathon/ui/components/dialog"
import type { Event, EventStatus } from "@estimathon/types"
import { toLocalInput, fromLocalInput } from "@/lib/format/event"

interface Props {
  event: Event
}

function defaultRescheduleValue(): string {
  return toLocalInput(new Date(Date.now() + 5 * 60_000).toISOString())
}

export function EventLifecycleActions({ event }: Readonly<Props>) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [newStartsAt, setNewStartsAt] = useState(defaultRescheduleValue)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  async function patch(body: Record<string, unknown>, successMsg: string) {
    setPending(true)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to update event")
      }
      toast.success(successMsg)
      router.refresh()
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
      return false
    } finally {
      setPending(false)
    }
  }

  function handleStartClick() {
    if (Date.parse(event.startsAt) > Date.now()) {
      void patch({ status: "active" }, "Event started")
    } else {
      setNewStartsAt(defaultRescheduleValue())
      setRescheduleError(null)
      setRescheduleOpen(true)
    }
  }

  async function submitReschedule(e: React.FormEvent) {
    e.preventDefault()
    const iso = fromLocalInput(newStartsAt)
    const parsed = Date.parse(iso)
    if (!Number.isFinite(parsed) || parsed <= Date.now()) {
      setRescheduleError("Start time must be in the future")
      return
    }
    setRescheduleError(null)
    const ok = await patch({ startsAt: iso, status: "active" }, "Event started")
    if (ok) setRescheduleOpen(false)
  }

  let primary: React.ReactNode = null
  switch (event.status) {
    case "draft":
      primary = (
        <Button disabled={pending} onClick={handleStartClick}>
          Start event
        </Button>
      )
      break
    case "active":
      primary = (
        <Button
          variant="destructive"
          disabled={pending}
          onClick={() => patch({ status: "ended" }, "Event ended")}
        >
          End event
        </Button>
      )
      break
    case "ended":
      primary = (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => patch({ status: "archived" }, "Event archived")}
        >
          Archive
        </Button>
      )
      break
    default:
      primary = null
  }

  return (
    <>
      {primary}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <form onSubmit={submitReschedule} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Reschedule and start</DialogTitle>
              <DialogDescription>
                The configured start time has already passed. Pick a new future
                start time - the duration ({event.durationMinutes} min) stays
                the same.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-starts-at">New start time</Label>
              <Input
                id="reschedule-starts-at"
                type="datetime-local"
                value={newStartsAt}
                onChange={(e) => setNewStartsAt(e.target.value)}
                required
              />
              {rescheduleError && (
                <p className="text-xs text-destructive">{rescheduleError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setRescheduleOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Starting…" : "Start event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
