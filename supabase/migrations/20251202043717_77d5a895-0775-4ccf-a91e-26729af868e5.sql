-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates (admin only)
CREATE POLICY "Admins can view email templates"
ON public.email_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'vice_president', 'admin')
  )
);

CREATE POLICY "Admins can update email templates"
ON public.email_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'vice_president', 'admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, variables, description, is_active)
VALUES 
(
  'application_confirmation',
  'ยืนยันการรับใบสมัคร SPU AI CLUB',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff1493 0%, #ff69b4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #ff1493; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #ff1493; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ยินดีต้อนรับสู่ SPU AI CLUB</h1>
    </div>
    <div class="content">
      <p>สวัสดีค่ะ/ครับ <strong>{{fullName}}</strong></p>
      
      <p>ขอบคุณที่สนใจสมัครเข้าร่วมงานกับ SPU AI CLUB! เราได้รับใบสมัครของคุณเรียบร้อยแล้ว</p>
      
      <div class="info-box">
        <h3>📋 รายละเอียดการสมัคร</h3>
        <p><strong>ตำแหน่ง:</strong> {{position}}</p>
        <p><strong>อีเมล:</strong> {{email}}</p>
        <p><strong>เบอร์โทร:</strong> {{phone}}</p>
      </div>
      
      <p>คุณสามารถติดตามสถานะใบสมัครได้ตลอดเวลาผ่านลิงก์ด้านล่าง:</p>
      
      <div style="text-align: center;">
        <a href="{{trackingUrl}}" class="button">ติดตามสถานะใบสมัคร</a>
      </div>
      
      <p><strong>หมายเลขติดตาม:</strong> <code>{{trackingToken}}</code></p>
      
      <p>ทีมงานของเราจะทำการตรวจสอบและประเมินใบสมัครของคุณ และจะแจ้งผลกลับให้ทราบโดยเร็วที่สุด</p>
      
      <p>หากมีข้อสงสัยประการใด สามารถติดต่อเราได้ที่อีเมลนี้</p>
      
      <p>ขอบคุณอีกครั้งสำหรับความสนใจ! 🚀</p>
      
      <p>ด้วยความเคารพ,<br><strong>ทีมงาน SPU AI CLUB</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 SPU AI CLUB. All rights reserved.</p>
      <p>Email นี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
    </div>
  </div>
</body>
</html>',
  '["fullName", "position", "email", "phone", "trackingToken", "trackingUrl"]'::jsonb,
  'อีเมลยืนยันการรับใบสมัครสำหรับผู้สมัคร พร้อมลิงก์ติดตามสถานะ',
  true
),
(
  'admin_notification',
  '[SPU AI CLUB] มีใบสมัครใหม่เข้ามา',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #ff1493; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 แจ้งเตือนใบสมัครใหม่</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <p><strong>⚠️ มีผู้สมัครใหม่เข้ามาในระบบ</strong></p>
      </div>
      
      <div class="info-box">
        <h3>📋 รายละเอียดผู้สมัคร</h3>
        <p><strong>ชื่อ-นามสกุล:</strong> {{fullName}}</p>
        <p><strong>ตำแหน่งที่สมัคร:</strong> {{position}}</p>
        <p><strong>อีเมล:</strong> {{email}}</p>
        <p><strong>เบอร์โทร:</strong> {{phone}}</p>
        <p><strong>Application ID:</strong> <code>{{applicationId}}</code></p>
      </div>
      
      <p>กรุณาเข้าสู่ระบบ Admin เพื่อตรวจสอบและประเมินใบสมัคร:</p>
      
      <div style="text-align: center;">
        <a href="{{adminUrl}}" class="button">เข้าสู่ระบบ Admin</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        💡 <strong>เคล็ดลับ:</strong> คุณสามารถตอบกลับผู้สมัครได้โดยตรงผ่านระบบ Admin
      </p>
    </div>
  </div>
</body>
</html>',
  '["fullName", "position", "email", "phone", "applicationId", "adminUrl"]'::jsonb,
  'อีเมลแจ้งเตือนแอดมินเมื่อมีใบสมัครใหม่เข้ามา',
  true
)
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();