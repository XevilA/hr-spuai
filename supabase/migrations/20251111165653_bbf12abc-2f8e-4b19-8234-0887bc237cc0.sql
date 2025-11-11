-- Create function to auto-assign super admin role to dev@dotmini.in.th
CREATE OR REPLACE FUNCTION public.handle_super_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user is the super admin email
  IF NEW.email = 'dev@dotmini.in.th' THEN
    -- Insert super admin role
    INSERT INTO public.user_roles (user_id, role, role_title)
    VALUES (NEW.id, 'super_admin', 'Super Administrator')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
DROP TRIGGER IF EXISTS on_super_admin_created ON auth.users;
CREATE TRIGGER on_super_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_super_admin_signup();