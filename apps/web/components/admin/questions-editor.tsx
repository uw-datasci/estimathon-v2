"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@estimathon/ui/components/button";
import { Input } from "@estimathon/ui/components/input";
import { Textarea } from "@estimathon/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@estimathon/ui/components/card";
import type { Question } from "@estimathon/types";

interface Props {
  eventId: string;
  questions: Question[];
}

interface DraftQuestion {
  id: string | null; // null while being created
  prompt: string;
  answer: string;
  position: number;
}

export function QuestionsEditor({ eventId, questions: initial }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftQuestion | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function startCreate() {
    const last = initial[initial.length - 1];
    const nextPosition = last ? last.position + 1 : 1;
    setDraft({
      id: null,
      prompt: "",
      answer: "",
      position: nextPosition,
    });
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.prompt.trim() || !draft.answer.trim()) {
      toast.error("Prompt and answer are required");
      return;
    }
    const answerNum = Number(draft.answer);
    if (!Number.isFinite(answerNum)) {
      toast.error("Answer must be a number");
      return;
    }
    setBusyId(draft.id ?? "new");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: draft.prompt,
          answer: answerNum,
          position: draft.position,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Question created");
      setDraft(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  async function patchQuestion(id: string, patch: { prompt?: string; answer?: number }) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {initial.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          busy={busyId === q.id}
          onSave={(patch) => patchQuestion(q.id, patch)}
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
              onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
            />
            <div className="grid gap-2 sm:max-w-xs">
              <Input
                placeholder="Answer (e.g. 42)"
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveDraft} disabled={busyId === "new"}>
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
  );
}

function QuestionCard({
  question,
  busy,
  onSave,
  onDelete,
}: {
  question: Question;
  busy: boolean;
  onSave: (patch: { prompt?: string; answer?: number }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [answer, setAnswer] = useState(String(question.answer ?? ""));

  function save() {
    const patch: { prompt?: string; answer?: number } = {};
    if (prompt !== question.prompt) patch.prompt = prompt;
    const answerNum = Number(answer);
    if (Number.isFinite(answerNum) && answerNum !== question.answer) patch.answer = answerNum;
    if (Object.keys(patch).length > 0) onSave(patch);
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">#{question.position}</span>
        </CardTitle>
        <div className="flex gap-1">
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
                  setEditing(false);
                  setPrompt(question.prompt);
                  setAnswer(String(question.answer ?? ""));
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
            <p className="mt-1 text-xs text-muted-foreground">
              answer = <span className="font-mono text-foreground">{question.answer}</span>
            </p>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
