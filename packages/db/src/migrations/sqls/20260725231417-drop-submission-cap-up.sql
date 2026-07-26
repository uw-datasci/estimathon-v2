-- submission_cap is retired: the attempt budget is now simply the number of
-- questions on the event (one live guess per question), so there's nothing
-- left to store per-event.
ALTER TABLE events DROP COLUMN submission_cap;
