-- Allow anyone to view their own application by email or phone
CREATE POLICY "Anyone can view applications by email or phone"
ON applications
FOR SELECT
TO anon, authenticated
USING (true);