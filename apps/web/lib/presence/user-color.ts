const PRESENCE_SLOTS = 8;

/**
 * Deterministic per-user color for realtime presence UI (e.g. the "teammate
 * is answering" outline/badge on question cards). Same userId always maps
 * to the same slot on every client, so no color needs to travel over the
 * wire - `packages/ui`'s globals.css defines `--presence-1..8` for both
 * light and dark themes.
 */
export function presenceColor(userId: string): string {
  return `var(--presence-${(hashString(userId) % PRESENCE_SLOTS) + 1})`;
}

/** djb2 string hash. Fast, deterministic, good-enough distribution for a
 * small fixed number of buckets. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}
