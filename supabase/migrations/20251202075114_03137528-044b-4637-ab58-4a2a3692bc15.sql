-- Function to send LINE notification for new applications
CREATE OR REPLACE FUNCTION public.notify_line_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_title TEXT;
  v_function_url TEXT;
BEGIN
  -- Get position title
  SELECT title INTO v_position_title
  FROM public.positions
  WHERE id = NEW.position_id;
  
  -- Construct the edge function URL
  v_function_url := current_setting('app.settings.supabase_url') || '/functions/v1/send-line-notification';
  
  -- Call the LINE notification edge function asynchronously
  PERFORM net.http_post(
    url := v_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    ),
    body := jsonb_build_object(
      'type', 'new_application',
      'applicantName', NEW.full_name,
      'email', NEW.email,
      'phone', NEW.phone,
      'position', COALESCE(v_position_title, 'ไม่ระบุตำแหน่ง'),
      'applicationId', NEW.id
    )
  );
  
  RAISE NOTICE 'LINE notification queued for new application: %', NEW.email;
  
  RETURN NEW;
END;
$$;

-- Function to send LINE notification for status changes
CREATE OR REPLACE FUNCTION public.notify_line_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_title TEXT;
  v_function_url TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get position title
    SELECT title INTO v_position_title
    FROM public.positions
    WHERE id = NEW.position_id;
    
    -- Construct the edge function URL
    v_function_url := current_setting('app.settings.supabase_url') || '/functions/v1/send-line-notification';
    
    -- Call the LINE notification edge function asynchronously
    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'type', 'status_change',
        'applicantName', NEW.full_name,
        'email', NEW.email,
        'position', COALESCE(v_position_title, 'ไม่ระบุตำแหน่ง'),
        'oldStatus', OLD.status,
        'newStatus', NEW.status,
        'applicationId', NEW.id
      )
    );
    
    RAISE NOTICE 'LINE notification queued for status change: % -> %', OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new applications
DROP TRIGGER IF EXISTS trigger_line_new_application ON public.applications;
CREATE TRIGGER trigger_line_new_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_line_new_application();

-- Create trigger for status changes
DROP TRIGGER IF EXISTS trigger_line_status_change ON public.applications;
CREATE TRIGGER trigger_line_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_line_status_change();