-- Estimathon v2 initial schema.
-- Players authenticate via the main club site's Supabase project. We store
-- only Supabase user.id (uuid) here; profile data is read from Supabase at
-- request time.

create extension if not exists pgcrypto;

-- Tournament instances.
-- Lifecycle: draft → admin clicks Start → active → admin clicks End → ended → archived.
-- The end of the game window is derived: starts_at + duration_minutes. This way,
-- rescheduling the start automatically shifts the end with it.
create table events (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  starts_at         timestamptz not null,
  duration_minutes  int  not null default 60 check (duration_minutes > 0),
  team_size_cap     int  not null default 5,
  submission_cap    int  not null default 18,
  question_count    int  not null default 13,
  status            text not null default 'draft'
                      check (status in ('draft','active','ended','archived')),
  created_at        timestamptz not null default now()
);

create index on events (status, starts_at desc);

-- Teams within an event
create table teams (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  code        text not null,
  name        text,
  created_at  timestamptz not null default now(),
  unique (event_id, code)
);

create index on teams (event_id);

-- Team memberships. event_id is denormalized so we can enforce the
-- "one team per user per event" rule without a multi-table check.
create table team_members (
  team_id    uuid not null references teams(id) on delete cascade,
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null,
  joined_at  timestamptz not null default now(),
  primary key (team_id, user_id),
  unique (event_id, user_id)
);

create index on team_members (user_id);
create index on team_members (event_id);

-- Questions per event
create table questions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  position     int  not null,
  prompt       text not null,
  answer       numeric not null,
  released_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (event_id, position)
);

create index on questions (event_id, position);

-- Submissions (history of range guesses; scoring uses latest per question)
create table submissions (
  id            bigserial primary key,
  team_id       uuid not null references teams(id) on delete cascade,
  question_id   uuid not null references questions(id) on delete cascade,
  user_id       uuid not null,
  min_value     numeric not null,
  max_value     numeric not null,
  submitted_at  timestamptz not null default now(),
  check (min_value > 0 and max_value >= min_value)
);

create index on submissions (team_id, submitted_at desc);
create index on submissions (question_id);
create index on submissions (team_id, question_id, submitted_at desc);
