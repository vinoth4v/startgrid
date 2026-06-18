-- ============================================================
-- Helper: read role from JWT user_metadata (set on signup/invite accept)
-- ============================================================
create or replace function public.user_role()
returns text
language sql stable security definer
as $$
  select coalesce(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata'  ->> 'role'
  );
$$;

-- ============================================================
-- Tables
-- ============================================================

create table invitations (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  role       text        check (role in ('startup', 'investor', 'admin')),
  token      text        unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid        references auth.users,
  used_at    timestamptz,
  created_at timestamptz default now()
);

create table startup_profiles (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users unique,
  company_name text,
  sector       text,
  stage        text,
  country      text,
  website      text,
  pitch_data   jsonb,
  logo_url     text,
  is_published boolean     default false,
  created_at   timestamptz default now()
);

create table investor_profiles (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users unique,
  name       text,
  firm       text,
  criteria   jsonb,
  created_at timestamptz default now()
);

create table connections (
  id          uuid        primary key default gen_random_uuid(),
  investor_id uuid        references investor_profiles,
  startup_id  uuid        references startup_profiles,
  status      text        default 'pending'
              check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz default now(),
  unique (investor_id, startup_id)
);

create table messages (
  id            uuid        primary key default gen_random_uuid(),
  connection_id uuid        references connections,
  sender_id     uuid        references auth.users,
  content       text        not null,
  admin_visible boolean     default true,
  created_at    timestamptz default now()
);

-- ============================================================
-- Enable RLS
-- ============================================================

alter table invitations       enable row level security;
alter table startup_profiles  enable row level security;
alter table investor_profiles enable row level security;
alter table connections       enable row level security;
alter table messages          enable row level security;

-- ============================================================
-- RLS Policies — invitations
-- ============================================================

-- Admins can do everything
create policy "admins manage invitations"
  on invitations for all
  using  (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- Anyone can look up an invitation by token (needed for the accept-invite flow)
create policy "read own invitation by token"
  on invitations for select
  using (true);  -- token is a secret; exposure is controlled at the API layer

-- ============================================================
-- RLS Policies — startup_profiles
-- ============================================================

-- Owners manage their own profile
create policy "startups manage own profile"
  on startup_profiles for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Investors can read published profiles
create policy "investors view published startups"
  on startup_profiles for select
  using (is_published = true and public.user_role() = 'investor');

-- Admins can read all
create policy "admins view all startup profiles"
  on startup_profiles for select
  using (public.user_role() = 'admin');

-- ============================================================
-- RLS Policies — investor_profiles
-- ============================================================

-- Owners manage their own profile
create policy "investors manage own profile"
  on investor_profiles for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Startups can read investor profiles
create policy "startups view investor profiles"
  on investor_profiles for select
  using (public.user_role() = 'startup');

-- Admins can read all
create policy "admins view all investor profiles"
  on investor_profiles for select
  using (public.user_role() = 'admin');

-- ============================================================
-- RLS Policies — connections
-- ============================================================

-- Investors create connection requests
create policy "investors create connections"
  on connections for insert
  with check (
    exists (
      select 1 from investor_profiles
      where id = investor_id and user_id = auth.uid()
    )
  );

-- Both parties can read their own connections; admins read all
create policy "parties view own connections"
  on connections for select
  using (
    public.user_role() = 'admin'
    or exists (
      select 1 from investor_profiles
      where id = investor_id and user_id = auth.uid()
    )
    or exists (
      select 1 from startup_profiles
      where id = startup_id and user_id = auth.uid()
    )
  );

-- Startups accept or decline; admins can also update
create policy "startups update connection status"
  on connections for update
  using (
    public.user_role() = 'admin'
    or exists (
      select 1 from startup_profiles
      where id = startup_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS Policies — messages
-- ============================================================

-- Either party in an accepted connection can send messages
create policy "connected parties send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from connections c
      where c.id = connection_id
        and c.status = 'accepted'
        and (
          exists (select 1 from investor_profiles where id = c.investor_id and user_id = auth.uid())
          or
          exists (select 1 from startup_profiles   where id = c.startup_id  and user_id = auth.uid())
        )
    )
  );

-- Either party can read messages in their connection; admins read all
create policy "connected parties read messages"
  on messages for select
  using (
    (public.user_role() = 'admin' and admin_visible = true)
    or exists (
      select 1 from connections c
      where c.id = connection_id
        and (
          exists (select 1 from investor_profiles where id = c.investor_id and user_id = auth.uid())
          or
          exists (select 1 from startup_profiles   where id = c.startup_id  and user_id = auth.uid())
        )
    )
  );
