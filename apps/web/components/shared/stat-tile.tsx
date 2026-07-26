import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
}

/** A label + big number, used for score panels and live admin highlights. */
export function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-2xl">{value}</span>
    </div>
  );
}
