-- Allow authenticated admins to update answer review fields and scores.
CREATE POLICY "Admins can update all answers" ON public.answers
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
