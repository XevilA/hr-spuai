-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  image_url TEXT,
  video_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  location_url TEXT,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  event_type TEXT NOT NULL DEFAULT 'workshop',
  target_audience TEXT[] DEFAULT ARRAY['all']::TEXT[],
  form_type TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  participant_type TEXT NOT NULL DEFAULT 'general',
  university TEXT,
  faculty TEXT,
  major TEXT,
  university_year INTEGER,
  company_name TEXT,
  job_title TEXT,
  dietary_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view active events" 
ON public.events FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all events" 
ON public.events FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert events" 
ON public.events FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update events" 
ON public.events FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete events" 
ON public.events FOR DELETE 
USING (is_admin(auth.uid()));

-- Event registrations policies
CREATE POLICY "Anyone can register for events" 
ON public.event_registrations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations FOR SELECT 
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admins can view all registrations" 
ON public.event_registrations FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update registrations" 
ON public.event_registrations FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete registrations" 
ON public.event_registrations FOR DELETE 
USING (is_admin(auth.uid()));

-- Create storage bucket for event images/videos
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);

-- Storage policies for events bucket
CREATE POLICY "Anyone can view event files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'events');

CREATE POLICY "Admins can upload event files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'events' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update event files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'events' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete event files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'events' AND is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();