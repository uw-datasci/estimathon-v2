import { Card, CardContent } from "@estimathon/ui/components/card";
import { StatTile } from "@/components/shared/stat-tile";
import { ScoreCounter } from "./score-counter";

interface ScorePanelProps {
  score: number;
  goodIntervals: number;
  remaining: number;
  questionCount: number;
}

export function ScorePanel({ score, goodIntervals, remaining, questionCount }: ScorePanelProps) {
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
            label="Guesses left"
            value={<span className="font-semibold tabular-nums">{remaining}</span>}
          />
        </div>
      </CardContent>
    </Card>
  );
}
