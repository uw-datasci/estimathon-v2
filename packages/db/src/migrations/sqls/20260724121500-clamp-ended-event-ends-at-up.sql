-- Ending an event early left ends_at at the scheduled timer, so the 24h
-- player visibility window never elapsed. Clamp to the best-known end time.
UPDATE events
SET ends_at = LEAST(
      ends_at,
      starts_at + make_interval(mins => duration_minutes),
      now()
    ),
    paused_at = NULL
WHERE status = 'ended'
  AND ends_at IS NOT NULL
  AND starts_at IS NOT NULL
  AND ends_at > LEAST(starts_at + make_interval(mins => duration_minutes), now());
