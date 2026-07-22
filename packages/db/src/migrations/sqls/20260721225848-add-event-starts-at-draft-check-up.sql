-- starts_at is nullable only for draft events; once an event has left the
-- draft state (active/ended/archived) it must have a real start time.
ALTER TABLE events
  ADD CONSTRAINT events_starts_at_draft_only
  CHECK (status = 'draft' OR starts_at IS NOT NULL);
