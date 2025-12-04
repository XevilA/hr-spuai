-- Add slug column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- Create a function to generate slug from title if not provided
CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9ก-๙]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    NEW.slug := regexp_replace(NEW.slug, '^-|-$', '', 'g');
    -- Add random suffix to ensure uniqueness
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS generate_event_slug_trigger ON public.events;
CREATE TRIGGER generate_event_slug_trigger
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_event_slug();

-- Update existing events with slugs
UPDATE public.events 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9ก-๙]+', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;