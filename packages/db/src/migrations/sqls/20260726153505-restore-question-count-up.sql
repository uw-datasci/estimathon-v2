-- question_count comes back as an explicit admin input alongside submission_cap:
-- the game is configured for a fixed number of questions (default 13) and a
-- separate total submission budget (default 18, per the original init schema).
ALTER TABLE events ADD COLUMN question_count int NOT NULL DEFAULT 13;
