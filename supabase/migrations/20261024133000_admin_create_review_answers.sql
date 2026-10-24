-- Allow admins to create review rows for unanswered questions.
CREATE POLICY "Admins can insert review answers" ON public.answers
  FOR INSERT WITH CHECK (public.is_admin());
