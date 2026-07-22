-- Estimathon v2 initial schema.
-- Players authenticate via the main club site's Supabase project. We store
-- only Supabase user.id (uuid) here; profile data is read from Supabase at
-- request time.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tournament instances.
-- Lifecycle: draft → admin clicks Start → active → admin clicks End → ended → archived.
-- The end of the game window is derived: starts_at + duration_minutes. This way,
-- rescheduling the start automatically shifts the end with it.
CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  starts_at         timestamptz NOT NULL,
  duration_minutes  int  NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  team_size_cap     int  NOT NULL DEFAULT 5,
  submission_cap    int  NOT NULL DEFAULT 18,
  question_count    int  NOT NULL DEFAULT 13,
  status            text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','active','ended','archived')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON events (status, starts_at DESC);

-- Teams within an event
CREATE TABLE teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code        text NOT NULL,
  name        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, code)
);

CREATE INDEX ON teams (event_id);

-- Team memberships. event_id is denormalized so we can enforce the
-- "one team per user per event" rule without a multi-table check.
CREATE TABLE team_members (
  team_id    uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id),
  UNIQUE (event_id, user_id)
);

CREATE INDEX ON team_members (user_id);
CREATE INDEX ON team_members (event_id);

-- Questions per event
CREATE TABLE questions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  position     int  NOT NULL,
  prompt       text NOT NULL,
  answer       numeric NOT NULL,
  released_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, position)
);

CREATE INDEX ON questions (event_id, position);

-- Submissions (history of range guesses; scoring uses latest per question)
CREATE TABLE submissions (
  id            bigserial PRIMARY KEY,
  team_id       uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_id   uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  min_value     numeric NOT NULL,
  max_value     numeric NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (min_value > 0 AND max_value >= min_value)
);

CREATE INDEX ON submissions (team_id, submitted_at DESC);
CREATE INDEX ON submissions (question_id);
CREATE INDEX ON submissions (team_id, question_id, submitted_at DESC);
