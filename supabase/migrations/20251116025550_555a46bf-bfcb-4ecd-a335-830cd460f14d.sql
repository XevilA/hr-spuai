-- Fix CV upload failing due to storage RLS on private bucket 'cvs'
-- Allow anonymous uploads only to the 'cvs' bucket while keeping others protected

CREATE POLICY "anon_insert_cvs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'cvs');

-- Allow reading object metadata for cvs bucket (to support createSignedUrl from client)
CREATE POLICY "anon_select_cvs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cvs');