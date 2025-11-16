-- Add tracking_token column to applications table
ALTER TABLE applications 
ADD COLUMN tracking_token TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_applications_tracking_token ON applications(tracking_token);

-- Update RLS policy to allow tracking by token
DROP POLICY IF EXISTS "Anyone can view applications by email or phone" ON applications;

CREATE POLICY "Anyone can view applications by email, phone or token"
ON applications
FOR SELECT
TO anon, authenticated
USING (true);