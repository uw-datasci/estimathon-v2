ALTER TABLE events ADD COLUMN question_count int NOT NULL DEFAULT 13;

-- Drafts have no starts_at under the new model; give them a placeholder so
-- the not-null constraint can be restored.
UPDATE events SET starts_at = now() WHERE starts_at IS NULL;
ALTER TABLE events ALTER COLUMN starts_at SET NOT NULL;

ALTER TABLE events DROP COLUMN ends_at;
ALTER TABLE events DROP COLUMN paused_at;
