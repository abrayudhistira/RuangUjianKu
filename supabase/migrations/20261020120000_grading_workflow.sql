ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS grading_mode TEXT NOT NULL DEFAULT 'automatic',
  ADD COLUMN IF NOT EXISTS show_correct_answers BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_incorrect_answers BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.exams
  DROP CONSTRAINT IF EXISTS exams_grading_mode_check;
ALTER TABLE public.exams
  ADD CONSTRAINT exams_grading_mode_check CHECK (grading_mode IN ('automatic', 'manual'));

ALTER TABLE public.exam_attempts
  DROP CONSTRAINT IF EXISTS exam_attempts_status_check;
ALTER TABLE public.exam_attempts
  ADD CONSTRAINT exam_attempts_status_check CHECK (status IN ('in_progress', 'submitted', 'under_review', 'graded'));
