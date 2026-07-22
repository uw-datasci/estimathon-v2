"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@estimathon/ui/components/button";
import { Input } from "@estimathon/ui/components/input";
import { Label } from "@estimathon/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@estimathon/ui/components/card";
import type { Event } from "@estimathon/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  durationMinutes: z.coerce.number().int().positive(),
  teamSizeCap: z.coerce.number().int().positive(),
  submissionCap: z.coerce.number().int().positive(),
});

type FormValues = z.infer<typeof schema>;

interface EventFormProps {
  initial?: Event;
  /** "create" hits POST /api/admin/events; otherwise PATCH /api/admin/events/[id]. */
  mode: "create" | "edit";
}

export function EventForm({ initial, mode }: Readonly<EventFormProps>) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      durationMinutes: initial?.durationMinutes ?? 60,
      teamSizeCap: initial?.teamSizeCap ?? 5,
      submissionCap: initial?.submissionCap ?? 18,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const body = {
        name: values.name,
        durationMinutes: values.durationMinutes,
        teamSizeCap: values.teamSizeCap,
        submissionCap: values.submissionCap,
      };
      const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }
      const event = (await res.json()) as Event;
      toast.success(mode === "create" ? "Event created" : "Event updated");
      router.push(`/admin/events/${event.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const { register, handleSubmit, formState } = form;
  const errors = formState.errors;

  let submitLabel: string;
  if (submitting) {
    submitLabel = "Saving…";
  } else if (mode === "create") {
    submitLabel = "Create event";
  } else {
    submitLabel = "Save";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>
            Name and duration. The event is created as a draft - use the Start button on the
            event page once its questions are ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Estimathon Winter 2026" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              min={1}
              {...register("durationMinutes")}
            />
            {errors.durationMinutes && (
              <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rules</CardTitle>
          <CardDescription>
            The submission cap also sets the number of questions - add exactly that many
            questions before starting the event.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="teamSizeCap">Team size cap</Label>
            <Input id="teamSizeCap" type="number" min={1} {...register("teamSizeCap")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="submissionCap">Submission cap</Label>
            <Input id="submissionCap" type="number" min={1} {...register("submissionCap")} />
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
  );
}
