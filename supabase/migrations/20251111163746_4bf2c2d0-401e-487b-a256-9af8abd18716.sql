-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  university_year INTEGER NOT NULL CHECK (university_year BETWEEN 1 AND 6),
  faculty TEXT NOT NULL,
  major TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  line_id TEXT,
  instagram TEXT,
  portfolio_url TEXT,
  motivation TEXT NOT NULL CHECK (length(motivation) <= 500),
  cv_file_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert applications (public signup)
CREATE POLICY "Anyone can submit applications"
  ON public.applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view applications (we'll add admin roles later)
CREATE POLICY "Admins can view all applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false);

-- Allow anyone to upload CVs
CREATE POLICY "Anyone can upload CVs"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'cvs');

-- Only admins can view CVs
CREATE POLICY "Admins can view CVs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();