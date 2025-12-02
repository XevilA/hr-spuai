-- Update applications that don't have tracking_token
UPDATE public.applications
SET tracking_token = EXTRACT(EPOCH FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 11)
WHERE tracking_token IS NULL;

-- Recreate the trigger function with better error handling and tracking token generation
CREATE OR REPLACE FUNCTION public.queue_status_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_title TEXT;
  v_template_name TEXT;
  v_tracking_url TEXT;
  v_tracking_token TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get position title
    SELECT title INTO v_position_title
    FROM public.positions
    WHERE id = NEW.position_id;
    
    -- Determine which template to use based on new status
    CASE NEW.status
      WHEN 'reviewing' THEN
        v_template_name := 'application_status_reviewing';
      WHEN 'accepted' THEN
        v_template_name := 'application_status_accepted';
      WHEN 'rejected' THEN
        v_template_name := 'application_status_rejected';
      ELSE
        -- Don't send notification for other statuses (pending, etc.)
        RETURN NEW;
    END CASE;
    
    -- Ensure tracking token exists
    IF NEW.tracking_token IS NULL THEN
      v_tracking_token := EXTRACT(EPOCH FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 11);
      UPDATE public.applications
      SET tracking_token = v_tracking_token
      WHERE id = NEW.id;
    ELSE
      v_tracking_token := NEW.tracking_token;
    END IF;
    
    -- Generate tracking URL
    v_tracking_url := 'https://spuaiclub.online/track-application?token=' || v_tracking_token;
    
    -- Insert into email queue
    INSERT INTO public.email_queue (
      template_name,
      recipient_email,
      variables,
      status,
      scheduled_at
    )
    VALUES (
      v_template_name,
      NEW.email,
      jsonb_build_object(
        'applicantName', NEW.full_name,
        'positionTitle', COALESCE(v_position_title, 'ไม่ระบุตำแหน่ง'),
        'trackingUrl', v_tracking_url
      ),
      'pending',
      NOW()
    );
    
    -- Log the queued email
    RAISE NOTICE 'Status notification email queued for % (% -> %)', NEW.email, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;