-- Events move to an explicit, staff-controlled timer: starts_at is set only
-- when the event is started (drafts have no start time), ends_at is stored
-- (rather than derived) so it can be nudged by pause/resume and +/-30s
-- adjustments, and paused_at marks a frozen clock.
ALTER TABLE events ALTER COLUMN starts_at DROP NOT NULL;
ALTER TABLE events ADD COLUMN ends_at   timestamptz;
ALTER TABLE events ADD COLUMN paused_at timestamptz;

-- Backfill ends_at for events that already have a window.
UPDATE events
   SET ends_at = starts_at + make_interval(mins => duration_minutes)
 WHERE status IN ('active', 'ended', 'archived');

-- Drafts never had a real start; clear it now that it's optional.
UPDATE events SET starts_at = NULL WHERE status = 'draft';

-- question_count is retired: submission_cap now doubles as the number of
-- questions (one submission per question), including in the scoring formula.
ALTER TABLE events DROP COLUMN question_count;
