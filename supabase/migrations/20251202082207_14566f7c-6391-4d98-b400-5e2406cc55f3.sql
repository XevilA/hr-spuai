-- Add RLS policies for admins to manage email_logs and email_queue

-- Allow admins to delete email_logs
CREATE POLICY "Admins can delete email logs"
ON public.email_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- Allow admins to delete from email_queue
CREATE POLICY "Admins can delete from email queue"
ON public.email_queue
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- Allow admins to insert into email_queue
CREATE POLICY "Admins can insert into email queue"
ON public.email_queue
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);