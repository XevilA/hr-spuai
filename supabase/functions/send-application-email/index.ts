import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
                <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                  💡 <strong>คำแนะนำ:</strong> หากมีคำถามหรือต้องการข้อมูลเพิ่มเติม สามารถสอบถามได้ผ่านทาง AI Chatbot "น้องกรีน" บนเว็บไซต์ของเราตลอด 24 ชั่วโมง
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความเคารพ</p>
                <p style="color: #8B5CF6; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
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
    review: {
      subject: "ผ่านการสัมภาษณ์เรียบร้อยแล้ว - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #3B82F6; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .highlight { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
              .highlight-text { font-size: 18px; font-weight: 600; margin: 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📝 SPU AI CLUB</h1>
                <p>Interview Completed</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="message">
                  <p><strong>✅ ท่านได้ผ่านการสัมภาษณ์เรียบร้อยแล้ว!</strong></p>
                  <p>ขอบคุณที่สละเวลามาร่วมสัมภาษณ์กับทีมงาน SPU AI CLUB ทีมงานประทับใจในศักยภาพและความตั้งใจของคุณเป็นอย่างมาก</p>
                </div>
                <div class="highlight">
                  <p class="highlight-text">⏱️ รอประกาศผลการพิจารณา</p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">กรุณารอประมาณ 1-2 วัน</p>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                  💡 <strong>หมายเหตุ:</strong> ทีมงานกำลังพิจารณาผลการสัมภาษณ์อย่างละเอียดเพื่อให้ได้สมาชิกที่เหมาะสมที่สุด เราจะแจ้งผลให้ทราบโดยเร็วที่สุด
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความเคารพ</p>
                <p style="color: #3B82F6; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
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
    approved: {
      subject: "🎉 ยินดีด้วย! คุณผ่านการสัมภาษณ์ - SPU AI CLUB",
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
              .highlight { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; }
              .highlight-text { font-size: 22px; font-weight: 700; margin: 0; }
              .congrats { font-size: 48px; margin-bottom: 10px; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
              .next-steps { background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 25px 0; }
              .next-steps h3 { color: #059669; margin: 0 0 15px 0; font-size: 18px; }
              .next-steps ul { margin: 0; padding-left: 20px; color: #374151; }
              .next-steps li { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎊 SPU AI CLUB</h1>
                <p>Welcome to the Team!</p>
              </div>
              <div class="content">
                <p class="greeting">สวัสดีค่ะ คุณ${fullName}</p>
                <div class="highlight">
                  <div class="congrats">🎉</div>
                  <p class="highlight-text">ยินดีด้วย! คุณผ่านการสัมภาษณ์</p>
                </div>
                <div class="message">
                  <p><strong>เราขอแสดงความยินดีด้วยอย่างยิ่ง!</strong></p>
                  <p>คุณได้รับการคัดเลือกให้เป็นส่วนหนึ่งของครอบครัว SPU AI CLUB แล้ว ทีมงานเห็นศักยภาพและความตั้งใจของคุณ และเชื่อมั่นว่าคุณจะเป็นกำลังสำคัญในการพัฒนาชมรมของเราให้เติบโตและแข็งแกร่งยิ่งขึ้น</p>
                </div>
                <div class="next-steps">
                  <h3>📋 ขั้นตอนถัดไป:</h3>
                  <ul>
                    <li>ทีมงานจะติดต่อกลับไปเพื่อแจ้งรายละเอียดการ Onboarding</li>
                    <li>เตรียมตัวเข้าร่วมกิจกรรมและโปรเจกต์ของชมรม</li>
                    <li>พบปะสมาชิกคนอื่นๆ และเริ่มต้นการเรียนรู้ด้าน AI ไปด้วยกัน</li>
                  </ul>
                </div>
                <p style="color: #059669; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0;">
                  ยินดีต้อนรับสู่ SPU AI CLUB! 🚀
                </p>
                <div class="divider"></div>
                <p style="color: #374151; margin: 0;">ด้วยความยินดี</p>
                <p style="color: #10B981; font-weight: 600; margin: 5px 0 0 0;">ทีมงาน SPU AI CLUB</p>
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
      subject: "ผลการพิจารณาใบสมัคร - SPU AI CLUB",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Noto Sans Thai', Arial, sans-serif; line-height: 1.8; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
              .message { background: #f3f4f6; padding: 25px; border-radius: 12px; border-left: 4px solid #6B7280; margin: 25px 0; }
              .message p { margin: 0 0 15px 0; color: #374151; font-size: 15px; }
              .message p:last-child { margin-bottom: 0; }
              .highlight { background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #e5e7eb; }
              .highlight-text { font-size: 18px; font-weight: 600; margin: 0; color: #374151; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              .footer strong { color: #374151; display: block; margin-bottom: 10px; font-size: 16px; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
              .encouragement { background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3B82F6; }
              .encouragement p { margin: 0; color: #1e40af; font-size: 15px; }
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
  status: 'pending' | 'review' | 'approved' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, fullName, status }: EmailRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Generate email content based on status
    const emailContent = getEmailTemplate(fullName, status);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SPU AI CLUB <onboarding@resend.dev>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
