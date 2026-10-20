ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS participant_name TEXT;
