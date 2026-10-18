ALTER TABLE public.answers
  ADD COLUMN IF NOT EXISTS manual_score INTEGER,
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.answers
  ADD CONSTRAINT answers_manual_score_non_negative CHECK (manual_score IS NULL OR manual_score >= 0);
