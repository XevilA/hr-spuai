-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  division TEXT,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active team members"
ON public.team_members
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all team members"
ON public.team_members
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update team members"
ON public.team_members
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete team members"
ON public.team_members
FOR DELETE
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();