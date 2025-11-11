-- Fix RLS policies for applications table
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;

-- Allow anyone (anonymous) to insert applications
CREATE POLICY "Anyone can submit applications"
ON public.applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated admins can view applications
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only authenticated admins can update applications
CREATE POLICY "Admins can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix storage policies for CVs bucket
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view CVs" ON storage.objects;

-- Allow anyone (anonymous and authenticated) to upload to cvs bucket
CREATE POLICY "Anyone can upload CV"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'cvs');

-- Only authenticated admins can view/download CVs
CREATE POLICY "Admins can view CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cvs' AND public.is_admin(auth.uid()));