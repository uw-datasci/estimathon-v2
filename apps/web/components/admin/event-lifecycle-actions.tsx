"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@estimathon/ui/components/button";
import { Input } from "@estimathon/ui/components/input";
import { Label } from "@estimathon/ui/components/label";
import { Alert, AlertDescription, AlertTitle } from "@estimathon/ui/components/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@estimathon/ui/components/dialog";
import type { Event } from "@estimathon/types";
import { toLocalInput, fromLocalInput } from "@/lib/format/event";

interface Props {
  event: Event;
  /** Number of questions currently added to this event. */
  questionsCount: number;
}

const ADD_TIME_STEP_SECONDS = 30;

function defaultStartValue(): string {
  return toLocalInput(new Date(Date.now() + 5 * 60_000).toISOString());
}

export function EventLifecycleActions({ event, questionsCount }: Readonly<Props>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [startsAt, setStartsAt] = useState(defaultStartValue);
  const [startError, setStartError] = useState<string | null>(null);

  const questionsReady = questionsCount === event.submissionCap;

  async function send(
    method: "PATCH" | "POST",
    path: string,
    body: Record<string, unknown> | undefined,
    successMsg: string
  ) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update event");
      }
      toast.success(successMsg);
      router.refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setPending(false);
    }
  }

  function openStartDialog() {
    setStartsAt(defaultStartValue());
    setStartError(null);
    setStartOpen(true);
  }

  async function submitStart(e: React.FormEvent) {
    e.preventDefault();
    if (!questionsReady) return;
    const iso = fromLocalInput(startsAt);
    const parsed = Date.parse(iso);
    if (!Number.isFinite(parsed) || parsed <= Date.now()) {
      setStartError("Start time must be in the future");
      return;
    }
    setStartError(null);
    const ok = await send("POST", "/start", { startsAt: iso }, "Event started");
    if (ok) setStartOpen(false);
  }

  let primary: React.ReactNode = null;
  switch (event.status) {
    case "draft":
      primary = (
        <Button disabled={pending} onClick={openStartDialog}>
          Start event
        </Button>
      );
      break;
    case "active":
      primary = (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              send("POST", "/add-time", { seconds: -ADD_TIME_STEP_SECONDS }, "Removed 30s")
            }
          >
            −30s
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              send("POST", "/add-time", { seconds: ADD_TIME_STEP_SECONDS }, "Added 30s")
            }
          >
            +30s
          </Button>
          {event.pausedAt ? (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => send("POST", "/resume", undefined, "Timer resumed")}
            >
              Resume
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => send("POST", "/pause", undefined, "Timer paused")}
            >
              Pause
            </Button>
          )}
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => send("PATCH", "", { status: "ended" }, "Event ended")}
          >
            End event
          </Button>
        </div>
      );
      break;
    case "ended":
      primary = (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => send("PATCH", "", { status: "archived" }, "Event archived")}
        >
          Archive
        </Button>
      );
      break;
    default:
      primary = null;
  }

  return (
    <>
      {primary}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <form onSubmit={submitStart} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Start event</DialogTitle>
              <DialogDescription>
                Pick when the event should start - players see a countdown until then. Once
                live, use Pause and +/-30s to adjust the clock; the start time can&apos;t be
                edited afterward.
              </DialogDescription>
            </DialogHeader>

            {!questionsReady && (
              <Alert variant="destructive">
                <AlertTitle>
                  {questionsCount === 0
                    ? "No questions added yet"
                    : "Question count doesn't match the submission cap"}
                </AlertTitle>
                <AlertDescription>
                  Add {event.submissionCap} question(s) before starting (currently{" "}
                  {questionsCount}).
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="starts-at">Start time</Label>
              <Input
                id="starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
              {startError && <p className="text-xs text-destructive">{startError}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setStartOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !questionsReady}>
                {pending ? "Starting…" : "Start event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
