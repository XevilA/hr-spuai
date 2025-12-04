-- Add check-in columns to event_registrations
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS check_in_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES auth.users(id);

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_event_registrations_check_in_token 
ON public.event_registrations(check_in_token);

-- Function to generate check-in token on insert
CREATE OR REPLACE FUNCTION public.generate_check_in_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_token IS NULL THEN
    NEW.check_in_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-generating check-in token
DROP TRIGGER IF EXISTS set_check_in_token ON public.event_registrations;
CREATE TRIGGER set_check_in_token
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_check_in_token();

-- Update existing registrations with tokens
UPDATE public.event_registrations 
SET check_in_token = encode(gen_random_bytes(16), 'hex')
WHERE check_in_token IS NULL;