import { Card, CardContent } from "@estimathon/ui/components/card"
import { ScoreCounter } from "./score-counter"

interface ScorePanelProps {
  score: number
  goodIntervals: number
  submissionCount: number
  submissionCap: number
}

export function ScorePanel({
  score,
  goodIntervals,
  submissionCount,
  submissionCap,
}: ScorePanelProps) {
  const remaining = Math.max(0, submissionCap - submissionCount)
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Stat
            label="Score"
            value={<ScoreCounter value={score} className="font-semibold" />}
          />
          <Stat
            label="Correct intervals"
            value={
              <span className="font-semibold tabular-nums">
                {goodIntervals}/{submissionCap}
              </span>
            }
          />
          <Stat
            label="Guesses left"
            value={
              <span className="font-semibold tabular-nums">{remaining}</span>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
        {label}
      </span>
      <span className="text-2xl">{value}</span>
    </div>
  )
}
