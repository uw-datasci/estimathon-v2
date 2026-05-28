"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@estimathon/ui/components/button"
import { Input } from "@estimathon/ui/components/input"
import { Label } from "@estimathon/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@estimathon/ui/components/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@estimathon/ui/components/card"
import type { Event, EventStatus } from "@estimathon/types"
import { toLocalInput, fromLocalInput } from "@/lib/format/event"

const STATUSES: EventStatus[] = ["draft", "active", "ended", "archived"]

const schema = z.object({
  name: z.string().min(1, "Required"),
  startsAt: z.string().min(1, "Required"),
  durationMinutes: z.coerce.number().int().positive(),
  teamSizeCap: z.coerce.number().int().positive(),
  submissionCap: z.coerce.number().int().positive(),
  questionCount: z.coerce.number().int().positive(),
  status: z.enum(["draft", "active", "ended", "archived"]),
})

type FormValues = z.infer<typeof schema>

interface EventFormProps {
  initial?: Event
  /** "create" hits POST /api/admin/events; otherwise PATCH /api/admin/events/[id]. */
  mode: "create" | "edit"
}

export function EventForm({ initial, mode }: Readonly<EventFormProps>) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      startsAt: toLocalInput(initial?.startsAt),
      durationMinutes: initial?.durationMinutes ?? 60,
      teamSizeCap: initial?.teamSizeCap ?? 5,
      submissionCap: initial?.submissionCap ?? 18,
      questionCount: initial?.questionCount ?? 13,
      status: initial?.status ?? "draft",
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const body = {
        name: values.name,
        startsAt: fromLocalInput(values.startsAt),
        durationMinutes: values.durationMinutes,
        teamSizeCap: values.teamSizeCap,
        submissionCap: values.submissionCap,
        questionCount: values.questionCount,
        status: values.status,
      }
      const url =
        mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${initial!.id}`
      const method = mode === "create" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Request failed")
      }
      const event = (await res.json()) as Event
      toast.success(mode === "create" ? "Event created" : "Event updated")
      router.push(`/admin/events/${event.id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setSubmitting(false)
    }
  }

  const { register, handleSubmit, setValue, control, formState } = form
  const status = useWatch({ control, name: "status" })
  const errors = formState.errors

  let submitLabel: string
  if (submitting) {
    submitLabel = "Saving…"
  } else if (mode === "create") {
    submitLabel = "Create event"
  } else {
    submitLabel = "Save"
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Name and schedule.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Estimathon Winter 2026"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startsAt">Starts at</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...register("startsAt")}
              />
              {errors.startsAt && (
                <p className="text-xs text-destructive">
                  {errors.startsAt.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                {...register("durationMinutes")}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-destructive">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rules</CardTitle>
          <CardDescription>
            Caps and the number of estimation questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="teamSizeCap">Team size cap</Label>
            <Input
              id="teamSizeCap"
              type="number"
              min={1}
              {...register("teamSizeCap")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="submissionCap">Submission cap</Label>
            <Input
              id="submissionCap"
              type="number"
              min={1}
              {...register("submissionCap")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="questionCount">Question count</Label>
            <Input
              id="questionCount"
              type="number"
              min={1}
              {...register("questionCount")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>
            Draft → Active → Ended → Archived. Use the Start / End buttons on
            the event page for the common lifecycle changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as EventStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
