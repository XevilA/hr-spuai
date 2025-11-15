-- Fix storage bucket policies for CVs
-- Remove duplicate policies and ensure proper access control

-- Drop duplicate policies
DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view CVs" ON storage.objects;

-- Create single, clear policy for CV uploads
-- Allow anyone to upload to cvs bucket (needed for public application form)
-- But restrict to only this bucket
CREATE POLICY "Allow CV uploads during application"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = '' -- Ensure files are in root of bucket, not subfolders
);

-- Allow admins to view all CVs
CREATE POLICY "Admins can view all CVs"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'cvs' AND
  is_admin(auth.uid())
);

-- Allow admins to delete CVs if needed
CREATE POLICY "Admins can delete CVs"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'cvs' AND
  is_admin(auth.uid())
);

-- Add bucket configuration to enforce file size limits
UPDATE storage.buckets
SET 
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
WHERE id = 'cvs';