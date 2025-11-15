-- Add university column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS university TEXT;

-- Update the column to be required (after adding it to allow existing rows)
-- We'll make it required in the application form validation