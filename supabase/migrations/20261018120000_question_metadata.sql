ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS case_context TEXT,
  ADD COLUMN IF NOT EXISTS correct_answer TEXT,
  ADD COLUMN IF NOT EXISTS model_answer TEXT,
  ADD COLUMN IF NOT EXISTS rubric TEXT;

CREATE INDEX IF NOT EXISTS idx_questions_exam_order ON public.questions(exam_id, order_index);
