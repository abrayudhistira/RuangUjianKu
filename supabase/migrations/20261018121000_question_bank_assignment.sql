ALTER TABLE public.questions
  ALTER COLUMN exam_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_unassigned ON public.questions(exam_id) WHERE exam_id IS NULL;
