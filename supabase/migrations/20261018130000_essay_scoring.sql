ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS essay_scoring_config JSONB NOT NULL DEFAULT '{"enabled": true, "review_threshold": 60, "bands": [{"similarity": 0, "points": 0}]}'::jsonb;

COMMENT ON COLUMN public.questions.essay_scoring_config IS 'Essay similarity grading configuration: enabled, review_threshold, and minimum similarity bands.';
