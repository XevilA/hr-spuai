-- Add position_id to applications table
ALTER TABLE public.applications 
ADD COLUMN position_id uuid REFERENCES public.positions(id);

-- Add index for better query performance
CREATE INDEX idx_applications_position_id ON public.applications(position_id);