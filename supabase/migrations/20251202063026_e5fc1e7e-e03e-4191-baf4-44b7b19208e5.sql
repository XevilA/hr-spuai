-- Insert email templates for status notifications
INSERT INTO public.email_templates (name, subject, html_content, description, variables, is_active)
VALUES 
  -- Template for "reviewing" status
  (
    'application_status_reviewing',
    'ใบสมัครของคุณอยู่ระหว่างการพิจารณา - SPU AI CLUB',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { color: #ff1493; font-size: 24px; font-weight: bold; }
    .status-badge { display: inline-block; background: #ffc107; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .content { margin: 20px 0; }
    .position { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .track-button { display: inline-block; background: #ff1493; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SPU AI CLUB</div>
      <h2>อัพเดทสถานะใบสมัคร</h2>
    </div>
    
    <div class="content">
      <p>สวัสดีค่ะคุณ <strong>{{applicantName}}</strong></p>
      
      <div class="status-badge">🔍 กำลังพิจารณา</div>
      
      <p>ทีมงานของเรากำลังพิจารณาใบสมัครของคุณสำหรับตำแหน่ง:</p>
      
      <div class="position">
        <strong>{{positionTitle}}</strong>
      </div>
      
      <p>ใบสมัครของคุณได้ผ่านการตรวจสอบเบื้องต้นแล้ว และขณะนี้อยู่ระหว่างการพิจารณาอย่างละเอียด เราจะแจ้งผลให้คุณทราบโดยเร็วที่สุด</p>
      
      <p>คุณสามารถติดตามสถานะใบสมัครได้ตลอดเวลาที่:</p>
      
      <div style="text-align: center;">
        <a href="{{trackingUrl}}" class="track-button">ติดตามสถานะใบสมัคร</a>
      </div>
    </div>
    
    <div class="footer">
      <p>หากมีคำถามเพิ่มเติม กรุณาติดต่อเราได้ที่ <a href="mailto:admin@greenliving.co.th">admin@greenliving.co.th</a></p>
      <p>&copy; 2024 SPU AI CLUB. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    'Email notification when application status changes to reviewing',
    '["applicantName", "positionTitle", "trackingUrl"]'::jsonb,
    true
  ),
  
  -- Template for "accepted" status
  (
    'application_status_accepted',
    '🎉 ยินดีด้วย! คุณผ่านการคัดเลือก - SPU AI CLUB',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { color: #ff1493; font-size: 24px; font-weight: bold; }
    .celebration { font-size: 60px; text-align: center; margin: 20px 0; }
    .status-badge { display: inline-block; background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .content { margin: 20px 0; }
    .position { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .highlight-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .track-button { display: inline-block; background: #ff1493; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SPU AI CLUB</div>
      <div class="celebration">🎉</div>
      <h2>ยินดีด้วย!</h2>
    </div>
    
    <div class="content">
      <p>สวัสดีค่ะคุณ <strong>{{applicantName}}</strong></p>
      
      <div class="status-badge">✅ ผ่านการคัดเลือก</div>
      
      <p>ขอแสดงความยินดี! เรายินดีที่จะแจ้งให้คุณทราบว่าคุณได้ผ่านการคัดเลือกสำหรับตำแหน่ง:</p>
      
      <div class="position">
        <strong>{{positionTitle}}</strong>
      </div>
      
      <div class="highlight-box">
        <strong>ขั้นตอนต่อไป:</strong>
        <ul>
          <li>ทีมงานจะติดต่อคุณเพื่อนัดหมายการสัมภาษณ์หรือแจ้งรายละเอียดเพิ่มเติมในเร็วๆ นี้</li>
          <li>กรุณาเช็คอีเมลและโทรศัพท์ของคุณเป็นประจำ</li>
          <li>หากมีคำถาม กรุณาติดต่อเราได้ทันที</li>
        </ul>
      </div>
      
      <p>เราตั้งตารอที่จะได้ทำงานร่วมกับคุณ!</p>
      
      <div style="text-align: center;">
        <a href="{{trackingUrl}}" class="track-button">ดูรายละเอียดเพิ่มเติม</a>
      </div>
    </div>
    
    <div class="footer">
      <p>หากมีคำถามเพิ่มเติม กรุณาติดต่อเราได้ที่ <a href="mailto:admin@greenliving.co.th">admin@greenliving.co.th</a></p>
      <p>&copy; 2024 SPU AI CLUB. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    'Email notification when application status changes to accepted',
    '["applicantName", "positionTitle", "trackingUrl"]'::jsonb,
    true
  ),
  
  -- Template for "rejected" status
  (
    'application_status_rejected',
    'ผลการพิจารณาใบสมัคร - SPU AI CLUB',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { color: #ff1493; font-size: 24px; font-weight: bold; }
    .status-badge { display: inline-block; background: #6c757d; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .content { margin: 20px 0; }
    .position { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .track-button { display: inline-block; background: #ff1493; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SPU AI CLUB</div>
      <h2>ผลการพิจารณาใบสมัคร</h2>
    </div>
    
    <div class="content">
      <p>สวัสดีค่ะคุณ <strong>{{applicantName}}</strong></p>
      
      <div class="status-badge">📋 ผลการพิจารณา</div>
      
      <p>ขอบคุณที่สนใจสมัครเข้าร่วมทีมกับเราสำหรับตำแหน่ง:</p>
      
      <div class="position">
        <strong>{{positionTitle}}</strong>
      </div>
      
      <p>หลังจากพิจารณาอย่างรอบคอบแล้ว เราเสียใจที่ต้องแจ้งให้ทราบว่าในครั้งนี้เรายังไม่สามารถเลือกคุณได้</p>
      
      <div class="info-box">
        <strong>💡 อย่าท้อใจ!</strong>
        <ul>
          <li>มีผู้สมัครจำนวนมากและการแข่งขันสูง</li>
          <li>เราสนับสนุนให้คุณสมัครอีกครั้งในตำแหน่งอื่นๆ ที่เหมาะสมกับคุณ</li>
          <li>ติดตามข่าวสารและโอกาสใหม่ๆ จากเราได้เสมอ</li>
        </ul>
      </div>
      
      <p>ขอบคุณสำหรับความสนใจ และหวังว่าจะได้พบกันอีกในโอกาสหน้า!</p>
      
      <div style="text-align: center;">
        <a href="{{trackingUrl}}" class="track-button">ดูตำแหน่งงานอื่นๆ</a>
      </div>
    </div>
    
    <div class="footer">
      <p>หากมีคำถามเพิ่มเติม กรุณาติดต่อเราได้ที่ <a href="mailto:admin@greenliving.co.th">admin@greenliving.co.th</a></p>
      <p>&copy; 2024 SPU AI CLUB. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
    'Email notification when application status changes to rejected',
    '["applicantName", "positionTitle", "trackingUrl"]'::jsonb,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Create function to queue notification email when status changes
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
    
    -- Generate tracking URL
    v_tracking_url := 'https://spuaiclub.online/track-application?token=' || NEW.tracking_token;
    
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

-- Create trigger on applications table
DROP TRIGGER IF EXISTS trigger_status_notification ON public.applications;

CREATE TRIGGER trigger_status_notification
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_status_notification_email();