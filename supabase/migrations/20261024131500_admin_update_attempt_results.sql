-- Allow authenticated admins to finalize attempt scores and statuses.
CREATE POLICY "Admins can update all attempts" ON public.exam_attempts
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
