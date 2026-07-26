import { Card, CardContent } from "@estimathon/ui/components/card";
import { StatTile } from "@/components/shared/stat-tile";
import { ScoreCounter } from "./score-counter";

interface ScorePanelProps {
  score: number;
  goodIntervals: number;
  answeredCount: number;
  questionCount: number;
}

export function ScorePanel({
  score,
  goodIntervals,
  answeredCount,
  questionCount,
}: ScorePanelProps) {
  const remaining = Math.max(0, questionCount - answeredCount);
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatTile
            label="Score"
            value={<ScoreCounter value={score} className="font-semibold" />}
          />
          <StatTile
            label="Correct intervals"
            value={
              <span className="font-semibold tabular-nums">
                {goodIntervals}/{questionCount}
              </span>
            }
          />
          <StatTile
            label="Questions left"
            value={<span className="font-semibold tabular-nums">{remaining}</span>}
          />
        </div>
      </CardContent>
    </Card>
  );
}
