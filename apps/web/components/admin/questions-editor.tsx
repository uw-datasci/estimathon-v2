"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@estimathon/ui/components/button"
import { Input } from "@estimathon/ui/components/input"
import { Textarea } from "@estimathon/ui/components/textarea"
import { Badge } from "@estimathon/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@estimathon/ui/components/card"
import type { Question } from "@estimathon/types"

interface Props {
  eventId: string
  questions: Question[]
}

interface DraftQuestion {
  id: string | null // null while being created
  prompt: string
  answer: string
  position: number
  releasedAt: string | null
}

export function QuestionsEditor({ eventId, questions: initial }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<DraftQuestion | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  const { releasableCount, hideableCount } = useMemo(() => {
    let releasable = 0
    let hideable = 0
    for (const q of initial) {
      if (q.releasedAt) hideable++
      else releasable++
    }
    return { releasableCount: releasable, hideableCount: hideable }
  }, [initial])

  async function setReleasedForAll(released: boolean) {
    const targets = initial.filter((q) => !!q.releasedAt !== released)
    if (targets.length === 0) return
    setBulkBusy(true)
    try {
      const results = await Promise.all(
        targets.map((q) =>
          fetch(`/api/admin/questions/${q.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ released }),
          })
        )
      )
      const failures = results.filter((r) => !r.ok).length
      if (failures > 0) {
        toast.error(
          `${failures} of ${targets.length} failed — refresh and try again`
        )
      } else {
        toast.success(
          released
            ? `Released ${targets.length} question${targets.length === 1 ? "" : "s"}`
            : `Hid ${targets.length} question${targets.length === 1 ? "" : "s"}`
        )
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setBulkBusy(false)
    }
  }

  function startCreate() {
    const last = initial[initial.length - 1]
    const nextPosition = last ? last.position + 1 : 1
    setDraft({
      id: null,
      prompt: "",
      answer: "",
      position: nextPosition,
      releasedAt: null,
    })
  }

  async function saveDraft() {
    if (!draft) return
    if (!draft.prompt.trim() || !draft.answer.trim()) {
      toast.error("Prompt and answer are required")
      return
    }
    const answerNum = Number(draft.answer)
    if (!Number.isFinite(answerNum)) {
      toast.error("Answer must be a number")
      return
    }
    setBusyId(draft.id ?? "new")
    try {
      const res = await fetch(`/api/admin/events/${eventId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: draft.prompt,
          answer: answerNum,
          position: draft.position,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Question created")
      setDraft(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  async function patchQuestion(
    id: string,
    patch: { prompt?: string; answer?: number; released?: boolean }
  ) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Deleted")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-3">
      {initial.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReleasedForAll(true)}
            disabled={bulkBusy || releasableCount === 0}
          >
            <Eye />
            Release all{releasableCount > 0 ? ` (${releasableCount})` : ""}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReleasedForAll(false)}
            disabled={bulkBusy || hideableCount === 0}
          >
            <EyeOff />
            Hide all{hideableCount > 0 ? ` (${hideableCount})` : ""}
          </Button>
        </div>
      )}
      {initial.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          busy={busyId === q.id || bulkBusy}
          onSave={(patch) => patchQuestion(q.id, patch)}
          onToggleRelease={() =>
            patchQuestion(q.id, { released: !q.releasedAt })
          }
          onDelete={() => deleteQuestion(q.id)}
        />
      ))}

      {draft && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              New question · #{draft.position}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Textarea
              placeholder="How many people are in the room right now?"
              value={draft.prompt}
              onChange={(e) =>
                setDraft({ ...draft, prompt: e.target.value })
              }
            />
            <div className="grid gap-2 sm:max-w-xs">
              <Input
                placeholder="Answer (e.g. 42)"
                value={draft.answer}
                onChange={(e) =>
                  setDraft({ ...draft, answer: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={saveDraft}
                disabled={busyId === "new"}
              >
                <Check />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraft(null)}
                disabled={busyId === "new"}
              >
                <X />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!draft && (
        <Button variant="outline" onClick={startCreate}>
          <Plus />
          Add question
        </Button>
      )}
    </div>
  )
}

function QuestionCard({
  question,
  busy,
  onSave,
  onToggleRelease,
  onDelete,
}: {
  question: Question
  busy: boolean
  onSave: (patch: { prompt?: string; answer?: number }) => void
  onToggleRelease: () => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState(question.prompt)
  const [answer, setAnswer] = useState(String(question.answer ?? ""))

  const released = !!question.releasedAt

  function save() {
    const patch: { prompt?: string; answer?: number } = {}
    if (prompt !== question.prompt) patch.prompt = prompt
    const answerNum = Number(answer)
    if (Number.isFinite(answerNum) && answerNum !== question.answer)
      patch.answer = answerNum
    if (Object.keys(patch).length > 0) onSave(patch)
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">#{question.position}</span>
          <Badge variant={released ? "default" : "outline"}>
            {released ? "Released" : "Locked"}
          </Badge>
        </CardTitle>
        <div className="flex gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onToggleRelease}
            disabled={busy}
            aria-label={released ? "Lock" : "Release"}
          >
            {released ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDelete}
            disabled={busy}
            aria-label="Delete"
          >
            <Trash2 />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="grid gap-2">
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <div className="grid gap-2 sm:max-w-xs">
              <Input
                placeholder="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={busy}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setPrompt(question.prompt)
                  setAnswer(String(question.answer ?? ""))
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="block w-full text-left text-sm"
            onClick={() => setEditing(true)}
          >
            <p className="text-foreground">{question.prompt}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              answer ={" "}
              <span className="text-foreground font-mono">
                {question.answer}
              </span>
            </p>
          </button>
        )}
      </CardContent>
    </Card>
  )
}
