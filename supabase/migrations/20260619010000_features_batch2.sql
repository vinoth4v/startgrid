-- ============================================================
-- StartGrid feature batch 2 migrations
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── 1. feed_events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feed_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid        REFERENCES auth.users,
  event_type  text        NOT NULL,
  startup_id  uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  investor_id uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  payload     jsonb       DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read feed" ON feed_events;
CREATE POLICY "Authenticated users read feed" ON feed_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Actors create own feed events" ON feed_events;
CREATE POLICY "Actors create own feed events" ON feed_events
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- ── 2. due_diligence ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS due_diligence (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  startup_id  uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  checklist   jsonb       DEFAULT '[]',
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);
ALTER TABLE due_diligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors manage own due diligence" ON due_diligence;
CREATE POLICY "Investors manage own due diligence" ON due_diligence
  FOR ALL USING (
    investor_id = (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
  );

-- ── 3. deal_pipeline ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_pipeline (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  startup_id  uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  stage       text        NOT NULL DEFAULT 'reviewing'
                CHECK (stage IN ('reviewing','due_diligence','term_sheet','closed_won','closed_lost')),
  notes       text,
  amount      text,
  position    integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE deal_pipeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors manage own pipeline" ON deal_pipeline;
CREATE POLICY "Investors manage own pipeline" ON deal_pipeline
  FOR ALL USING (
    investor_id = (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
  );

-- ── 4. startup_documents ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS startup_documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  uuid        REFERENCES startup_profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  file_url    text        NOT NULL,
  file_size   bigint,
  mime_type   text,
  is_public   boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE startup_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Startups manage own documents" ON startup_documents;
CREATE POLICY "Startups manage own documents" ON startup_documents
  FOR ALL USING (
    startup_id = (SELECT id FROM startup_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Investors view public documents" ON startup_documents;
CREATE POLICY "Investors view public documents" ON startup_documents
  FOR SELECT USING (
    is_public = true AND auth.uid() IS NOT NULL
  );

-- ── 5. investor_feedback ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_feedback (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id     uuid        REFERENCES investor_profiles(id) ON DELETE CASCADE,
  startup_id      uuid        REFERENCES startup_profiles(id)  ON DELETE CASCADE,
  overall_rating  integer     CHECK (overall_rating BETWEEN 1 AND 5),
  team_rating     integer     CHECK (team_rating    BETWEEN 1 AND 5),
  market_rating   integer     CHECK (market_rating  BETWEEN 1 AND 5),
  product_rating  integer     CHECK (product_rating BETWEEN 1 AND 5),
  comment         text,
  is_anonymous    boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);
ALTER TABLE investor_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors manage own feedback" ON investor_feedback;
CREATE POLICY "Investors manage own feedback" ON investor_feedback
  FOR ALL USING (
    investor_id = (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Startups view own feedback" ON investor_feedback;
CREATE POLICY "Startups view own feedback" ON investor_feedback
  FOR SELECT USING (
    startup_id = (SELECT id FROM startup_profiles WHERE user_id = auth.uid())
  );

-- ── 6. Extra columns on startup_profiles ──────────────────────
ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS readiness_score      integer,
  ADD COLUMN IF NOT EXISTS readiness_feedback   jsonb,
  ADD COLUMN IF NOT EXISTS funding_goal_amount  text,
  ADD COLUMN IF NOT EXISTS funding_raised       text,
  ADD COLUMN IF NOT EXISTS funding_round_status text DEFAULT 'open';
