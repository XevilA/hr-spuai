import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getEmailTemplate(fullName: string, status: string) {
  const templates = {
    pending: {
      subject: "ได้รับใบสมัครเรียบร้อยแล้ว - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #8B5CF6; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .highlight { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
              .highlight-text { font-size: 18px; font-weight: 600; margin: 0; }
              .btn { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .btn:hover { opacity: 0.9; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 SPU AI CLUB</h1>
                <p>Sripatum University Artificial Intelligence Club</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="message">
                  <p><strong>✅ เราได้รับใบสมัครของคุณเรียบร้อยแล้ว!</strong></p>
                  <p>ขอบคุณที่สนใจสมัครเข้าร่วมชมรม SPU AI CLUB ทีมงานของเรารู้สึกยินดีเป็นอย่างยิ่งที่ได้รับใบสมัครจากคุณ</p>
                </div>
                <div class="highlight">
                  <p class="highlight-text">⏱️ อยู่ระหว่างการพิจารณา</p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">กรุณารอประมาณ 1-2 วัน</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://urcywqpdbyrduzfzvvne.lovableproject.com/track?token={{TRACKING_TOKEN}}" class="btn">
                    🔍 ติดตามสถานะใบสมัคร
                  </a>
                  <p style="color: #6b7280; font-size: 13px; margin-top: 15px;">
                    หรือคลิกลิงก์นี้: <br/>
                    <span style="color: #8B5CF6; word-break: break-all;">https://urcywqpdbyrduzfzvvne.lovableproject.com/track?token={{TRACKING_TOKEN}}</span>
                  </p>
                </div>
                <div class="divider"></div>
                <div class="message">
                  <p><strong>📋 ขั้นตอนต่อไป:</strong></p>
                  <p>1. ทีมงานจะทำการตรวจสอบใบสมัครและเอกสารของคุณ</p>
                  <p>2. หากผ่านการคัดเลือกเบื้องต้น เราจะติดต่อกลับเพื่อนัดหมายสัมภาษณ์</p>
                  <p>3. คุณสามารถติดตามสถานะได้ตลอดเวลาผ่านลิงก์ด้านบน</p>
                </div>
                <p style="color: #6b7280; font-size: 15px; text-align: center; margin: 25px 0;">
                  หากมีคำถามเพิ่มเติม สามารถติดต่อเราได้ที่อีเมลหรือเบอร์โทรด้านล่าง
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความเคารพ</p>
                <p style="color: #6B7280; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
              </div>
              <div class="footer">
                <strong>SPU AI CLUB</strong>
                <p>Sripatum University | มหาวิทยาลัยศรีปทุม</p>
                <p>📧 spu.ai.club@spu.ac.th | 📱 064-223-0671</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    reviewing: {
      subject: "อัพเดทสถานะ: กำลังพิจารณาใบสมัครของคุณ - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #3B82F6; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .highlight { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
              .highlight-text { font-size: 18px; font-weight: 600; margin: 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 SPU AI CLUB</h1>
                <p>Application Update</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="highlight">
                  <p class="highlight-text">🔍 กำลังพิจารณาใบสมัครของคุณ</p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">อยู่ระหว่างการประเมินโดยทีมงาน</p>
                </div>
                <div class="message">
                  <p>ใบสมัครของคุณผ่านการตรวจสอบเบื้องต้นแล้ว และตอนนี้อยู่ในขั้นตอนการพิจารณาอย่างละเอียดโดยทีมงานของเรา</p>
                  <p><strong>⏰ โปรดรอการติดต่อกลับภายใน 2-3 วันทำการ</strong></p>
                  <p>เราจะแจ้งผลการพิจารณาให้คุณทราบผ่านทางอีเมลนี้</p>
                </div>
                <p style="color: #6b7280; font-size: 15px; text-align: center; margin: 25px 0;">
                  ขอบคุณสำหรับความสนใจและความอดทนรอคอย
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความเคารพ</p>
                <p style="color: #6B7280; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
              </div>
              <div class="footer">
                <strong>SPU AI CLUB</strong>
                <p>Sripatum University | มหาวิทยาลัยศรีปทุม</p>
                <p>📧 spu.ai.club@spu.ac.th | 📱 064-223-0671</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    accepted: {
      subject: "🎉 ยินดีด้วย! คุณผ่านการคัดเลือก - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #10B981; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .celebration { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; }
              .celebration-emoji { font-size: 48px; margin-bottom: 15px; }
              .celebration-text { font-size: 24px; font-weight: bold; margin: 15px 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎊 SPU AI CLUB</h1>
                <p>Congratulations!</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="celebration">
                  <div class="celebration-emoji">🎉</div>
                  <p class="celebration-text">ยินดีด้วย!</p>
                  <p style="margin: 0; font-size: 16px; opacity: 0.95;">คุณผ่านการคัดเลือกเข้าร่วมชมรม SPU AI CLUB</p>
                </div>
                <div class="message">
                  <p>เราดีใจเป็นอย่างยิ่งที่จะได้ต้อนรับคุณเข้าสู่ครอบครัว SPU AI CLUB!</p>
                  <p>หลังจากการพิจารณาอย่างรอบคอบ ทีมงานเห็นว่าคุณมีศักยภาพและความตั้งใจที่จะเติบโตไปพร้อมกับเรา</p>
                </div>
                <div class="message">
                  <p><strong>📅 ขั้นตอนต่อไป:</strong></p>
                  <p>• ทีมงานจะติดต่อคุณเร็วๆ นี้เพื่อแจ้งรายละเอียดการเข้าร่วมกิจกรรม</p>
                  <p>• เตรียมตัวพบกับประสบการณ์ที่น่าตื่นเต้นกับโปรเจกต์ AI</p>
                  <p>• พบกับเพื่อนใหม่ที่มีความสนใจเดียวกัน</p>
                </div>
                <p style="color: #6b7280; font-size: 15px; text-align: center; margin: 25px 0;">
                  ยินดีต้อนรับสู่ SPU AI CLUB! เราหวังว่าจะได้ทำงานร่วมกับคุณเร็วๆ นี้
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความยินดี</p>
                <p style="color: #6B7280; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
              </div>
              <div class="footer">
                <strong>SPU AI CLUB</strong>
                <p>Sripatum University | มหาวิทยาลัยศรีปทุม</p>
                <p>📧 spu.ai.club@spu.ac.th | 📱 064-223-0671</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    rejected: {
      subject: "ขอบคุณสำหรับใบสมัคร - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #6366F1; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .encouragement { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; }
              .encouragement p { margin: 0 0 10px 0; }
              .encouragement p:last-child { margin-bottom: 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>SPU AI CLUB</h1>
                <p>Application Result</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="message">
                  <p>ขอบคุณที่สละเวลาอันมีค่ามาสมัครเข้าร่วมชมรม SPU AI CLUB และเข้าร่วมกระบวนการสัมภาษณ์กับเรา</p>
                  <p>หลังจากการพิจารณาอย่างรอบคอบแล้ว ทีมงานขอแจ้งให้ทราบว่า <strong>ในครั้งนี้เราไม่สามารถรับคุณเข้าเป็นสมาชิกได้</strong></p>
                </div>
                <div class="encouragement">
                  <p><strong>💪 อย่าท้อแท้!</strong> การไม่ผ่านในครั้งนี้ไม่ได้หมายความว่าคุณไม่มีความสามารถ อาจเป็นเพราะตำแหน่งที่เปิดรับมีจำนวนจำกัดหรือทักษะที่ต้องการในตอนนี้อาจแตกต่างไปจากสิ่งที่คุณมี</p>
                </div>
                <div class="message">
                  <p><strong>🌟 คำแนะนำจากเรา:</strong></p>
                  <p>• พัฒนาทักษะด้าน AI และเทคโนโลยีอย่างต่อเนื่อง</p>
                  <p>• ติดตามข่าวสารและกิจกรรมของชมรมผ่านช่องทางต่างๆ</p>
                  <p>• สามารถสมัครใหม่ได้อีกครั้งในรอบถัดไป</p>
                </div>
                <p style="color: #6b7280; font-size: 15px; text-align: center; margin: 25px 0;">
                  เราหวังว่าจะได้พบคุณอีกครั้งในอนาคต และขอให้คุณประสบความสำเร็จในเส้นทางที่คุณเลือก
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความเคารพ</p>
                <p style="color: #6B7280; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
              </div>
              <div class="footer">
                <strong>SPU AI CLUB</strong>
                <p>Sripatum University | มหาวิทยาลัยศรีปทุม</p>
                <p>📧 spu.ai.club@spu.ac.th | 📱 064-223-0671</p>
              </div>
            </div>
          </body>
        </html>
      `
    }
  };

  return templates[status as keyof typeof templates] || templates.pending;
}

interface EmailRequest {
  to: string;
  fullName: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  applicationId?: string;
  cvFilePath?: string;
  position?: string;
  email?: string;
  phone?: string;
  trackingToken?: string;
}

// Helper function to send email via Gmail SMTP
async function sendGmailEmail(
  to: string,
  subject: string,
  html: string,
  fromName: string = "SPU AI CLUB"
) {
  const GMAIL_USER = Deno.env.get("GMAIL_USER");
  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials not configured");
  }

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 587,
      tls: true,
      auth: {
        username: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
      },
    },
  });

  try {
    await client.send({
      from: `${fromName} <${GMAIL_USER}>`,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });
    
    await client.close();
    console.log(`Email sent successfully to: ${to}`);
  } catch (error) {
    await client.close();
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      fullName, 
      status, 
      applicationId, 
      cvFilePath, 
      position, 
      email, 
      phone, 
      trackingToken 
    }: EmailRequest = await req.json();
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    // Generate email content based on status
    const emailContent = getEmailTemplate(fullName, status);
    
    // Replace tracking token placeholder if provided
    let emailHtml = emailContent.html;
    if (trackingToken) {
      emailHtml = emailHtml.replace(/{{TRACKING_TOKEN}}/g, trackingToken);
    }

    // Send email to applicant using Gmail SMTP
    await sendGmailEmail(to, emailContent.subject, emailHtml, "SPU AI CLUB");
    
    console.log("Email sent successfully to applicant");

    // Send notification to Admin if status is pending and CV file exists
    if (status === 'pending' && cvFilePath && applicationId) {
      const cvUrl = `${SUPABASE_URL}/storage/v1/object/public/cvs/${cvFilePath}`;
      const adminEmail = "dev@dotmini.in.th"; // Admin email
      
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 30px; }
              .info-box { background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0; }
              .info-row { margin: 10px 0; color: #374151; }
              .info-label { font-weight: 600; color: #1f2937; }
              .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 5px; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 ใบสมัครใหม่!</h1>
              </div>
              <div class="content">
                <p style="font-size: 18px; color: #1f2937; font-weight: 600;">มีใบสมัครใหม่เข้ามา</p>
                <div class="info-box">
                  <div class="info-row"><span class="info-label">ชื่อ:</span> ${fullName}</div>
                  <div class="info-row"><span class="info-label">อีเมล:</span> ${email || 'N/A'}</div>
                  <div class="info-row"><span class="info-label">เบอร์โทร:</span> ${phone || 'N/A'}</div>
                  <div class="info-row"><span class="info-label">ตำแหน่ง:</span> ${position || 'N/A'}</div>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${cvUrl}" class="button">📄 ดาวน์โหลด CV/Resume</a>
                  <a href="https://urcywqpdbyrduzfzvvne.lovableproject.com/admin" class="button">👤 ดูใบสมัครเต็ม</a>
                </div>
              </div>
              <div class="footer">
                <strong>SPU AI CLUB Admin System</strong>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await sendGmailEmail(
          adminEmail, 
          `🔔 ใบสมัครใหม่จาก ${fullName}`, 
          adminEmailHtml,
          "SPU AI CLUB Admin"
        );
        console.log("Admin notification sent successfully via Gmail");
      } catch (error) {
        console.error("Failed to send admin notification:", error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully via Gmail SMTP" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-application-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
