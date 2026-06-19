-- ============================================================
-- StartGrid Admin Features Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. ai_prompts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  persona text CHECK (persona IN ('startup','investor','system')),
  category text CHECK (category IN (
    'pitch_generation','investment_brief','readiness_score',
    'pitch_coach','profile_enrichment','feedback_analysis',
    'comparables','system'
  )),
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  model text DEFAULT 'claude-sonnet-4-6',
  max_tokens int DEFAULT 1000,
  temperature numeric DEFAULT 0.7,
  is_active boolean DEFAULT true,
  version int DEFAULT 1,
  created_by uuid REFERENCES auth.users,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only" ON ai_prompts;
CREATE POLICY "Admin only" ON ai_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ── 2. ai_prompt_versions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES ai_prompts ON DELETE CASCADE,
  version int,
  system_prompt text,
  user_prompt_template text,
  changed_by uuid REFERENCES auth.users,
  change_note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_prompt_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only versions" ON ai_prompt_versions;
CREATE POLICY "Admin only versions" ON ai_prompt_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ── 3. Seed ai_prompts with all existing prompts ───────────────
INSERT INTO ai_prompts (key, name, description, persona, category, system_prompt, user_prompt_template, model, max_tokens, temperature)
VALUES
(
  'pitch_generation',
  'Startup Pitch Deck Generator',
  'Generates a 10-slide investor pitch deck from startup onboarding data',
  'startup',
  'pitch_generation',
  'You are an expert startup pitch deck writer with 20 years of experience helping founders raise venture capital. You write compelling, data-driven pitch decks that resonate with institutional investors.',
  'Create a 10-slide investor pitch deck for this startup. Return ONLY a valid JSON array with exactly 10 objects, each with "title" (string) and "content" (string, 3-5 sentences).

Slides: 1. Cover, 2. Problem, 3. Solution, 4. Market Size, 5. Product, 6. Traction, 7. Business Model, 8. Team, 9. Financials & Ask, 10. Vision

Startup data:
Company: {{company_name}} | Sector: {{sector}} | Stage: {{stage}} | Country: {{country}}
Website: {{website}} | Description: {{description}}
Problem: {{problem}} | Solution: {{solution}}
Market size: {{market_size}} | Traction: {{traction}}
Team: {{team_background}} | Funding ask: {{funding_amount}} | Use of funds: {{use_of_funds}}',
  'claude-sonnet-4-6',
  2000,
  0.7
),
(
  'investment_brief',
  'Investor AI Investment Brief',
  'Generates a structured investment analysis brief for a specific startup',
  'investor',
  'investment_brief',
  'You are an investment analyst at a top-tier venture capital firm. You write concise, insightful investment briefs that help partners make informed investment decisions.',
  'Based on the following startup information, write a concise investment brief with exactly these 5 sections (each 2-3 sentences). Return ONLY JSON, no other text.

Startup: {{company_name}}
Sector: {{sector}} | Stage: {{stage}} | Location: {{location}}
Founded: {{founded_year}} | Team size: {{employee_count}}

Pitch deck content:
{{pitch_text}}

Return this JSON:
{
  "companyOverview": "...",
  "marketOpportunity": "...",
  "teamStrengths": "...",
  "keyRisks": "...",
  "investmentThesis": "..."
}',
  'claude-sonnet-4-6',
  1024,
  0.5
),
(
  'readiness_score',
  'Startup Investor Readiness Score',
  'Evaluates a startup''s investor readiness and provides actionable feedback',
  'startup',
  'readiness_score',
  'You are a startup investor readiness analyst with deep experience evaluating early-stage companies for investment. You provide honest, constructive feedback to help founders improve their investor pitch.',
  'Evaluate this startup''s investor readiness on a scale of 0-100 and provide a grade (A=80+, B=60-79, C=40-59, D<40). Return ONLY JSON.

Startup: {{company_name}} | Sector: {{sector}} | Stage: {{stage}}
Has logo: {{has_logo}} | Has pitch deck: {{has_pitch}} ({{slide_count}} slides)
Has traction data: {{has_traction}} | Has team info: {{has_team}} | Has LinkedIn: {{has_linkedin}}
Is published: {{is_published}} | Employee count: {{employee_count}}
Description: {{description}}
Problem: {{problem}}
Solution: {{solution}}
Traction: {{traction}}
Funding ask: {{funding_amount}}
Use of funds: {{use_of_funds}}

Return:
{
  "grade": "A|B|C|D",
  "score": 0-100,
  "summary": "One sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}',
  'claude-sonnet-4-6',
  800,
  0.5
),
(
  'pitch_coach',
  'Startup Pitch Coach Questions',
  'Provides contextual coaching tips and follow-up questions for pitch practice',
  'startup',
  'pitch_coach',
  'You are an expert pitch coach who has helped hundreds of founders raise funding from top VCs. You ask probing questions and provide specific, actionable coaching feedback.',
  'The founder is practising answering this investor question: "{{question}}"

Their answer: "{{answer}}"

Provide:
1. Brief assessment of their answer (2 sentences)
2. What was strong
3. What to improve
4. A follow-up question an investor would likely ask

Return as JSON: { "assessment": "...", "strength": "...", "improvement": "...", "followUp": "..." }',
  'claude-sonnet-4-6',
  600,
  0.7
),
(
  'comparable_deals',
  'Investment Comparable Deals',
  'Finds comparable investment deals and market context for a startup',
  'investor',
  'comparables',
  'You are a venture capital research analyst specialising in deal comparables and market intelligence. You provide accurate, relevant comparable deals to help investors benchmark opportunities.',
  'Find 3-5 comparable investment deals for this startup. Focus on companies in the same sector and stage that have raised funding in the last 3 years.

Startup: {{company_name}}
Sector: {{sector}} | Stage: {{stage}} | Location: {{location}}
Description: {{description}}

Return JSON array: [{ "company": "...", "amount": "...", "stage": "...", "year": "...", "investors": "...", "relevance": "one sentence why comparable" }]',
  'claude-sonnet-4-6',
  1000,
  0.3
),
(
  'profile_enrichment',
  'Profile Enrichment',
  'Enriches startup profile data with market context and suggested improvements',
  'system',
  'profile_enrichment',
  'You are a startup data enrichment specialist. You analyse startup profiles and suggest improvements to make them more compelling to investors.',
  'Analyse this startup profile and suggest 3 specific improvements to make it more compelling to investors.

Company: {{company_name}} | Sector: {{sector}} | Stage: {{stage}}
Current description: {{description}}

Return JSON: { "improvements": [{ "field": "...", "current": "...", "suggested": "...", "reason": "..." }] }',
  'claude-sonnet-4-6',
  600,
  0.7
),
(
  'feedback_analysis',
  'Investor Feedback Analysis',
  'Analyses aggregated investor feedback patterns to provide startup insights',
  'system',
  'feedback_analysis',
  'You are a startup advisor who specialises in interpreting investor feedback patterns to help founders understand how they are perceived by the investment community.',
  'Analyse this aggregated investor feedback for {{company_name}} and provide actionable insights.

Ratings: Overall={{overall}}/5, Team={{team}}/5, Market={{market}}/5, Product={{product}}/5
Comments: {{comments}}

Return JSON: { "topStrength": "...", "mainConcern": "...", "actionableAdvice": "...", "investorPerception": "..." }',
  'claude-sonnet-4-6',
  500,
  0.5
),
(
  'admin_intelligence_report',
  'Weekly Platform Intelligence Report',
  'Generates a weekly AI intelligence report for platform administrators',
  'system',
  'system',
  'You are a Chief of Staff at a European VC firm that operates an investment platform. Write a concise, insightful weekly platform intelligence report for the managing partners. Be analytical, highlight what matters, flag risks and opportunities. Use data to support every claim.',
  'Here is this week''s StartGrid platform data:
- New startups joined: {{new_startups}}
- New investors joined: {{new_investors}}
- Profiles published: {{published_count}}
- Connection requests sent: {{connection_requests}}
- Messages exchanged: {{messages_count}}
- Most active sectors: {{top_sectors}}
- Geographic breakdown: {{countries}}
- AI features used: {{ai_usage}}
- Pending moderation queue: {{pending_review}}
- Top unconnected match score: {{top_match_score}}
- Platform costs this week: ${{cost}}

Write a structured intelligence report. Return JSON with these exact keys:
{
  "executiveSummary": ["bullet 1", "bullet 2", "bullet 3"],
  "growthAnalysis": "paragraph",
  "qualityAssessment": "paragraph",
  "matchmakingOpportunities": [{"startup": "...", "investor": "...", "reason": "..."}],
  "platformHealth": "paragraph",
  "recommendedActions": [{"action": "...", "priority": "High|Medium|Low", "reason": "..."}],
  "trendForecast": "paragraph"
}',
  'claude-sonnet-4-6',
  2000,
  0.6
),
(
  'moderation_quality',
  'Pitch Deck Quality Assessment',
  'AI quality scoring for startup profiles pending moderation review',
  'system',
  'system',
  'You are a senior investment analyst conducting quality control on startup pitch decks submitted to an investment platform. Be rigorous and objective.',
  'Rate this pitch deck quality from 0-100. Check: completeness, clarity, specificity, market credibility, team strength, financial realism.

Company: {{company_name}} | Sector: {{sector}} | Stage: {{stage}}
Slides: {{slide_count}} of 10
Description: {{description}}
Pitch content summary: {{pitch_summary}}
Has logo: {{has_logo}} | Has traction: {{has_traction}} | Has team info: {{has_team}}

Return JSON:
{
  "score": 0-100,
  "flags": ["issue 1", "issue 2"],
  "recommendation": "approve|revise|reject",
  "summary": "one sentence assessment"
}',
  'claude-sonnet-4-6',
  400,
  0.3
),
(
  'matchmaking_reasoning',
  'Smart Matchmaking Reasoning',
  'Explains why a specific startup-investor pair is or is not a strong match',
  'system',
  'system',
  'You are a venture capital matchmaker with deep expertise in connecting the right startups with the right investors. You provide specific, evidence-based reasoning about match quality.',
  'Given this investor''s criteria and this startup''s profile, explain in 2-3 sentences why this is or is not a strong match. Be specific about what aligns and what does not.

Investor: {{investor_name}} at {{firm}}
Criteria: Stages={{stages}}, Sectors={{sectors}}, Geographies={{geographies}}

Startup: {{company_name}}
Sector: {{sector}} | Stage: {{stage}} | Location: {{location}}
Description: {{description}}
Ask: {{funding_ask}}

Return JSON: { "reasoning": "2-3 sentence explanation", "alignmentPoints": ["point 1", "point 2"], "concerns": ["concern 1"] }',
  'claude-sonnet-4-6',
  400,
  0.5
)
ON CONFLICT (key) DO NOTHING;

-- ── 4. admin_matches ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid REFERENCES startup_profiles ON DELETE CASCADE,
  investor_id uuid REFERENCES investor_profiles ON DELETE CASCADE,
  match_score int,
  ai_reasoning text,
  alignment_points jsonb DEFAULT '[]',
  concerns jsonb DEFAULT '[]',
  status text DEFAULT 'suggested' CHECK (status IN ('suggested','introduced','connected','archived')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (startup_id, investor_id)
);
ALTER TABLE admin_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only matches" ON admin_matches;
CREATE POLICY "Admin only matches" ON admin_matches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- ── 5. api_usage_log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only usage" ON api_usage_log;
CREATE POLICY "Admin only usage" ON api_usage_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- ── 6. error_log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text,
  message text,
  page text,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only errors" ON error_log;
CREATE POLICY "Admin only errors" ON error_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- ── 7. admin_reports ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_data jsonb,
  period_start date,
  period_end date,
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only reports" ON admin_reports;
CREATE POLICY "Admin only reports" ON admin_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- ── 8. startup_profiles: moderation columns ───────────────────
ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'draft'
    CHECK (review_status IN ('draft','pending_review','approved','rejected','revision_requested')),
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Back-fill: published profiles are already approved
UPDATE startup_profiles
SET review_status = 'approved'
WHERE is_published = true AND review_status = 'draft';

-- ── 9. broadcast_messages ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  segment jsonb DEFAULT '[]',
  channels jsonb DEFAULT '["notification"]',
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','scheduled')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  sent_count int DEFAULT 0,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only broadcast" ON broadcast_messages;
CREATE POLICY "Admin only broadcast" ON broadcast_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );
