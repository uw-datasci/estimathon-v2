"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Lock, Send, X } from "lucide-react";
import { Button } from "@estimathon/ui/components/button";
import { Input } from "@estimathon/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@estimathon/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@estimathon/ui/components/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@estimathon/ui/components/tooltip";
import type { EditingPresence, Question, Submission } from "@estimathon/types";
import { cn } from "@estimathon/ui/lib/utils";
import { postEditingPresence } from "@/hooks/use-event-stream";
import type { SessionIdentity } from "@/lib/auth/session";
import { presenceColor } from "@/lib/presence/user-color";

const HEARTBEAT_MS = 10_000;
const BLUR_GRACE_MS = 150;

interface QuestionCardProps {
  question: Question;
  latest: Submission | null;
  onSubmit: (min: number, max: number) => Promise<void>;
  disabled?: boolean;
  /** Teammates (never the local user) currently editing this question. */
  editors?: EditingPresence[];
  /**
   * Whether the team's latest submission for this question is inside the
   * answer's range. Undefined when there's no submission (or no evaluation)
   * yet - the card stays neutral.
   */
  correct?: boolean;
  /** Present only when the local session has a known identity to announce. */
  presence?: {
    eventId: string;
    teamId: string;
    currentUser: SessionIdentity;
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function QuestionCard({
  question,
  latest,
  onSubmit,
  disabled,
  editors = [],
  correct,
  presence,
}: Readonly<QuestionCardProps>) {
  const prefersReduced = useReducedMotion();
  const latestSyncKey = latest ? `${latest.id}:${latest.minValue}:${latest.maxValue}` : "";
  const [min, setMin] = useState(latest ? String(latest.minValue) : "");
  const [max, setMax] = useState(latest ? String(latest.maxValue) : "");
  const [prevLatestSyncKey, setPrevLatestSyncKey] = useState(latestSyncKey);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const justLockedRef = useRef(0);
  const [pulseToken, setPulseToken] = useState(0);
  const editingRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Reflect server updates (e.g. teammate submitted) back into the inputs,
  // but don't clobber a field the local user is actively editing.
  if (latestSyncKey !== prevLatestSyncKey && !focused) {
    setPrevLatestSyncKey(latestSyncKey);
    setMin(latest ? String(latest.minValue) : "");
    setMax(latest ? String(latest.maxValue) : "");
  }

  function startEditing() {
    if (!presence || editingRef.current) return;
    editingRef.current = true;
    const { eventId, teamId, currentUser } = presence;
    postEditingPresence(eventId, teamId, question.id, true, currentUser);
    heartbeatRef.current = setInterval(() => {
      postEditingPresence(eventId, teamId, question.id, true, currentUser);
    }, HEARTBEAT_MS);
  }

  function stopEditing() {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = undefined;
    if (!presence || !editingRef.current) return;
    editingRef.current = false;
    const { eventId, teamId, currentUser } = presence;
    postEditingPresence(eventId, teamId, question.id, false, currentUser);
  }

  function handleFocus() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setFocused(true);
    startEditing();
  }

  function handleBlur() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    // Grace period so tabbing between the min/max inputs doesn't flicker
    // the "answering" indicator off and back on for teammates.
    blurTimerRef.current = setTimeout(() => {
      setFocused(false);
      stopEditing();
    }, BLUR_GRACE_MS);
  }

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      stopEditing();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    const minNum = Number(min);
    const maxNum = Number(max);
    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum <= 0 || maxNum < minNum)
      return;
    setSubmitting(true);
    try {
      await onSubmit(minNum, maxNum);
      justLockedRef.current = Date.now();
      setPulseToken((t) => t + 1);
      stopEditing();
    } finally {
      setSubmitting(false);
    }
  }

  const locked = !!latest;
  const beingEdited = editors.length > 0;
  const evaluated = correct !== undefined;
  const settleAnimation = prefersReduced
    ? undefined
    : {
        scale: [1, 1.02, 1],
        transition: { duration: 0.4, ease: "easeOut" as const },
      };
  const editorColors = editors.map((editor) => presenceColor(editor.userId));
  // A single editor still needs two gradient stops to render as a solid
  // outline rather than a transparent-to-color fade.
  const outlineStops =
    editorColors.length === 1 ? [editorColors[0], editorColors[0]] : editorColors;

  return (
    <motion.div
      key={pulseToken}
      animate={pulseToken > 0 ? settleAnimation : undefined}
      className="relative"
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-colors",
          locked && !evaluated && "border-primary/50",
          evaluated &&
            (correct
              ? "border-emerald-500/60 bg-emerald-500/5"
              : "border-red-500/60 bg-red-500/5")
        )}
      >
        <motion.div
          key={`ring-${pulseToken}`}
          initial={{ opacity: pulseToken > 0 && !prefersReduced ? 1 : 0 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary/40 ring-offset-2"
          aria-hidden
        />
        {beingEdited && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              padding: 2,
              background: `linear-gradient(120deg, ${outlineStops.join(", ")})`,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          />
        )}
        {beingEdited && (
          <span className="sr-only">
            {editors.map((editor) => editor.name).join(", ")}{" "}
            {editors.length === 1 ? "is" : "are"} answering this question
          </span>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
            <span>
              <span className="text-muted-foreground">#{question.position}</span>{" "}
              <span className="text-foreground">{question.prompt}</span>
            </span>
            {evaluated ? (
              correct ? (
                <Check
                  className="text-emerald-600 dark:text-emerald-400"
                  size={14}
                  aria-label="Answer is in range"
                />
              ) : (
                <X
                  className="text-red-600 dark:text-red-400"
                  size={14}
                  aria-label="Answer is out of range"
                />
              )
            ) : (
              locked && <Lock className="text-primary" size={14} aria-label="Range submitted" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="min"
              value={min}
              min={0}
              onChange={(e) => setMin(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled || submitting}
              className="text-right tabular-nums"
              inputMode="decimal"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="max"
              value={max}
              min={0}
              onChange={(e) => setMax(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled || submitting}
              className="text-right tabular-nums"
              inputMode="decimal"
            />
            <Button
              size="icon-sm"
              onClick={handleSubmit}
              disabled={disabled || submitting || !min || !max}
              aria-label="Submit"
            >
              <Send />
            </Button>
          </div>
        </CardContent>
      </Card>
      {beingEdited && (
        <div className="absolute -top-2 right-2 z-10">
          <AvatarGroup>
            {editors.slice(0, 3).map((editor) => (
              <Tooltip key={editor.userId}>
                <TooltipTrigger asChild>
                  <Avatar size="sm">
                    {editor.avatarUrl && <AvatarImage src={editor.avatarUrl} alt="" />}
                    <AvatarFallback
                      className="font-semibold text-white"
                      style={{ background: presenceColor(editor.userId) }}
                    >
                      {initials(editor.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{editor.name}</TooltipContent>
              </Tooltip>
            ))}
            {editors.length > 3 && (
              <AvatarGroupCount className="size-6 text-xs">
                +{editors.length - 3}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        </div>
      )}
    </motion.div>
  );
}
