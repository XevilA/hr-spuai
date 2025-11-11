-- Add interests_skills column to applications table
ALTER TABLE public.applications 
ADD COLUMN interests_skills text;