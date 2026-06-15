-- ============================================================
-- RepoFlow AI — Supabase PostgreSQL Schema
-- ============================================================
-- Run this in your Supabase SQL editor to initialize the DB.
-- Enable pgvector extension for future on-DB embeddings.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgvector";

-- ============================================================
-- USERS & SUBSCRIPTIONS
-- ============================================================

-- Mirrors Supabase auth.users, extended with app-specific data
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  tier          text not null default 'free' check (tier in ('free', 'starter', 'pro')),
  search_count  integer not null default 0,          -- resets monthly
  search_reset_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Stripe subscription tracking
create table public.subscriptions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  stripe_price_id      text,
  tier                 text not null check (tier in ('starter', 'pro')),
  status               text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- REPO INDEXING (The "Brain")
-- ============================================================

-- Curated list of high-quality repos to index
create table public.repos (
  id            uuid primary key default uuid_generate_v4(),
  github_url    text not null unique,
  owner         text not null,
  name          text not null,
  description   text,
  category      text not null check (category in (
    'frontend', 'backend', 'fullstack', 'ui-library', 'auth', 'database', 'api'
  )),
  tags          text[] default '{}',               -- e.g. ['react', 'tailwind', 'nextjs']
  stars         integer default 0,
  last_indexed_at timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Individual indexed files from each repo
create table public.indexed_files (
  id              uuid primary key default uuid_generate_v4(),
  repo_id         uuid not null references public.repos(id) on delete cascade,
  file_path       text not null,                   -- e.g. "components/auth/LoginForm.tsx"
  github_url      text not null,                   -- direct link to the file on GitHub
  raw_url         text not null,                   -- raw content URL for fetching
  language        text,                            -- "typescript", "python", etc.
  content         text not null,                   -- full source code
  content_hash    text not null,                   -- SHA of content for change detection
  pinecone_id     text,                            -- ID of the vector in Pinecone
  token_count     integer,
  last_updated_at timestamptz,
  created_at      timestamptz not null default now(),
  unique (repo_id, file_path)
);

-- Index for fast repo lookups
create index on public.indexed_files(repo_id);
create index on public.indexed_files(language);

-- ============================================================
-- BLUEPRINTS (Generated Glue Code)
-- ============================================================

create table public.blueprints (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  query             text not null,                 -- original user prompt
  frontend_file_id  uuid references public.indexed_files(id),
  backend_file_id   uuid references public.indexed_files(id),
  
  -- Generated output sections
  blueprint_md      text not null,                 -- full Blueprint in markdown
  glue_frontend     text,                          -- isolated frontend glue code
  glue_backend      text,                          -- isolated backend glue code
  integration_steps jsonb,                         -- ordered list of steps
  
  -- Source attribution (trust layer)
  sources           jsonb not null default '[]',   -- [{repo, file_path, github_url, lines}]
  
  -- Metadata
  ai_model          text not null,                 -- "gpt-4o", "claude-3-5-sonnet", etc.
  tier_at_creation  text not null,                 -- tier used when generated
  tokens_used       integer,
  latency_ms        integer,
  rating            smallint check (rating between 1 and 5),
  feedback          text,
  
  created_at        timestamptz not null default now()
);

create index on public.blueprints(user_id);
create index on public.blueprints(created_at desc);

-- ============================================================
-- SEARCH HISTORY
-- ============================================================

create table public.search_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  query       text not null,
  blueprint_id uuid references public.blueprints(id),
  tier        text not null,
  created_at  timestamptz not null default now()
);

create index on public.search_history(user_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.blueprints     enable row level security;
alter table public.search_history enable row level security;
alter table public.repos          enable row level security;
alter table public.indexed_files  enable row level security;

-- Profiles: users can only read/update their own row
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Subscriptions: users can only view their own
create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- Blueprints: users can CRUD their own
create policy "Users can manage own blueprints"
  on public.blueprints for all using (auth.uid() = user_id);

-- Search history: users can view/insert their own
create policy "Users can manage own search history"
  on public.search_history for all using (auth.uid() = user_id);

-- Repos & indexed files: public read, service role write
create policy "Public can read repos"
  on public.repos for select using (true);

create policy "Public can read indexed files"
  on public.indexed_files for select using (true);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Reset monthly search count
create or replace function public.reset_monthly_searches()
returns void as $$
begin
  update public.profiles
  set search_count = 0,
      search_reset_at = now()
  where search_reset_at < now() - interval '1 month';
end;
$$ language plpgsql security definer;
