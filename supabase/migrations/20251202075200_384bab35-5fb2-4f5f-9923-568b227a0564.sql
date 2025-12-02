-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send LINE notification for new applications (with hard-coded URL)
CREATE OR REPLACE FUNCTION public.notify_line_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_title TEXT;
BEGIN
  -- Get position title
  SELECT title INTO v_position_title
  FROM public.positions
  WHERE id = NEW.position_id;
  
  -- Call the LINE notification edge function asynchronously
  PERFORM net.http_post(
    url := 'https://urcywqpdbyrduzfzvvne.supabase.co/functions/v1/send-line-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3l3cXBkYnlyZHV6Znp2dm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjczNzQsImV4cCI6MjA3ODQ0MzM3NH0._IAbE03FEut_k5J44Zt35c9ditbu8vRI3ZasBQ1P0FM'
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
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Failed to send LINE notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Function to send LINE notification for status changes (with hard-coded URL)
CREATE OR REPLACE FUNCTION public.notify_line_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_title TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get position title
    SELECT title INTO v_position_title
    FROM public.positions
    WHERE id = NEW.position_id;
    
    -- Call the LINE notification edge function asynchronously
    PERFORM net.http_post(
      url := 'https://urcywqpdbyrduzfzvvne.supabase.co/functions/v1/send-line-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3l3cXBkYnlyZHV6Znp2dm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjczNzQsImV4cCI6MjA3ODQ0MzM3NH0._IAbE03FEut_k5J44Zt35c9ditbu8vRI3ZasBQ1P0FM'
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
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the update
  RAISE WARNING 'Failed to send LINE notification: %', SQLERRM;
  RETURN NEW;
END;
$$;