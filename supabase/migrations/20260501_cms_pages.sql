-- ================================================================
-- CMS schema for Sito Agenzia
-- Run this once on Supabase (SQL editor).
-- It creates idempotent tables for pages, draft/published content
-- and revision history. RLS uses authenticated role for writes.
-- ================================================================

create extension if not exists "pgcrypto";

-- =========== site_pages ===========
create table if not exists site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text,
  description text,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb,
  draft_updated_at timestamptz default now(),
  published_at timestamptz,
  version int not null default 1
);

create index if not exists idx_site_pages_slug on site_pages(slug);

-- =========== site_revisions ===========
create table if not exists site_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references site_pages(id) on delete cascade,
  version int not null,
  content jsonb not null,
  created_at timestamptz default now(),
  created_by text
);

create index if not exists idx_site_revisions_page_version
  on site_revisions(page_id, version desc);

-- =========== RLS ===========
alter table site_pages enable row level security;
alter table site_revisions enable row level security;

drop policy if exists "site_pages_read_all" on site_pages;
create policy "site_pages_read_all" on site_pages
  for select using (true);

drop policy if exists "site_pages_write_authenticated" on site_pages;
create policy "site_pages_write_authenticated" on site_pages
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "site_revisions_read_all" on site_revisions;
create policy "site_revisions_read_all" on site_revisions
  for select using (true);

drop policy if exists "site_revisions_write_authenticated" on site_revisions;
create policy "site_revisions_write_authenticated" on site_revisions
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ================================================================
-- Note: server-side admin actions use the SUPABASE_SERVICE_ROLE_KEY
-- (createAdminClient in lib/server.ts) which bypasses RLS, so the
-- CMS API works regardless of the Supabase auth state.
-- ================================================================
