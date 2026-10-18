-- Storage policies for the existing `photo-profile` bucket.
-- Files must be stored under: <authenticated-user-id>/<filename>

CREATE POLICY "Authenticated users can upload own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photo-profile'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Authenticated users can update own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photo-profile'
  AND owner_id = (select auth.uid()::text)
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'photo-profile'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Authenticated users can delete own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photo-profile'
  AND owner_id = (select auth.uid()::text)
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Required when the bucket is public and the application uses getPublicUrl().
CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photo-profile');
