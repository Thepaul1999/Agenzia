-- Log visite scheda immobile (una riga per vista conteggiata dall'API /api/immobile/visita).
-- RLS attivo senza policy: accesso solo tramite service role (createAdminClient).

create table if not exists public.immobile_visite_log (
  id uuid primary key default gen_random_uuid(),
  immobile_id uuid not null references public.immobili (id) on delete cascade,
  visited_at timestamptz not null default now()
);

create index if not exists immobile_visite_log_immobile_visited_idx
  on public.immobile_visite_log (immobile_id, visited_at desc);

alter table public.immobile_visite_log enable row level security;
