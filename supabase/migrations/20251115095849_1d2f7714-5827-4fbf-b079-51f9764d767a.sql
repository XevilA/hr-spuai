-- Drop existing storage policy for CV uploads
DROP POLICY IF EXISTS "Allow CV uploads during application" ON storage.objects;

-- Create new policy that allows anonymous and authenticated users to upload CVs
CREATE POLICY "Anyone can upload CVs"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = ''
);