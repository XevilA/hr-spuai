-- Create trigger on applications table for status change notifications
DROP TRIGGER IF EXISTS trigger_status_notification ON public.applications;

CREATE TRIGGER trigger_status_notification
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_status_notification_email();