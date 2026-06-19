-- ============================================================
-- StartGrid feature migrations
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── 1. startup_profiles: identity + share token columns ────────
ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS raw_onboarding_data jsonb,
  ADD COLUMN IF NOT EXISTS logo_url            text,
  ADD COLUMN IF NOT EXISTS cover_image_url     text,
  ADD COLUMN IF NOT EXISTS address             text,
  ADD COLUMN IF NOT EXISTS city                text,
  ADD COLUMN IF NOT EXISTS founded_year        text,
  ADD COLUMN IF NOT EXISTS employee_count      text,
  ADD COLUMN IF NOT EXISTS linkedin_url        text,
  ADD COLUMN IF NOT EXISTS share_token         text DEFAULT encode(gen_random_bytes(16), 'hex');

-- Back-fill share_token for existing rows that have none
UPDATE startup_profiles
SET share_token = encode(gen_random_bytes(16), 'hex')
WHERE share_token IS NULL;

-- ── 2. investor_favourites ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_favourites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  startup_id  uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);
ALTER TABLE investor_favourites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors manage own favourites" ON investor_favourites;
CREATE POLICY "Investors manage own favourites" ON investor_favourites
  FOR ALL USING (
    investor_id = (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
  );

-- ── 3. notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users,
  type       text,
  title      text,
  body       text,
  read       boolean     DEFAULT false,
  link       text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ── 4. investor_notes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  startup_id  uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  content     text,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);
ALTER TABLE investor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors see own notes" ON investor_notes;
CREATE POLICY "Investors see own notes" ON investor_notes
  FOR ALL USING (
    investor_id = (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
  );

-- ── 5. milestones ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid        REFERENCES startup_profiles(id) ON DELETE CASCADE,
  type       text        CHECK (type IN (
               'first_revenue','new_customer','team_hire',
               'product_launch','funding_closed','partnership','other'
             )),
  title      text        NOT NULL,
  description text,
  date       date        DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Startups manage own milestones" ON milestones;
CREATE POLICY "Startups manage own milestones" ON milestones
  FOR ALL USING (
    startup_id = (SELECT id FROM startup_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can read published milestones" ON milestones;
CREATE POLICY "Anyone can read published milestones" ON milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM startup_profiles
      WHERE id = milestones.startup_id AND is_published = true
    )
  );
