import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  event_id: string;
  subject: string;
  message: string;
  recipient_ids?: string[];
  include_qr?: boolean;
  email_type?: "welcome" | "news" | "certificate";
}

async function generateCertificate(participantName: string, eventTitle: string, eventDate: string): Promise<string | null> {
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not set");
    return null;
  }

  try {
    const prompt = `Generate a professional certificate of participation with these details:
- Participant Name: ${participantName}
- Event: ${eventTitle}
- Date: ${eventDate}
- Organization: SPU AI CLUB, Sripatum University

Design requirements:
- Elegant, formal certificate design
- Gold or blue accent colors
- Include decorative borders
- Text in Thai style with English elements
- Landscape orientation, 16:9 aspect ratio
- Include "Certificate of Participation" or "เกียรติบัตร" as header
- Professional and celebratory design`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Certificate generation API error:", errorText);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log("Certificate generated successfully for:", participantName);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error generating certificate:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, subject, message, recipient_ids, include_qr, email_type = "welcome" }: EmailRequest = await req.json();

    console.log(`Processing ${email_type} email for event ${event_id}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    // Get registrations
    let query = supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", event_id);

    if (recipient_ids && recipient_ids.length > 0) {
      query = query.in("id", recipient_ids);
    }

    const { data: registrations, error: regError } = await query;

    if (regError) {
      throw new Error("Failed to fetch registrations");
    }

    if (!registrations || registrations.length === 0) {
      return new Response(JSON.stringify({ error: "No registrations found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = "https://spuaiclub.online";
    const results = [];
    const errors = [];

    // Format event date for certificate
    const eventDateFormatted = new Date(event.event_date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    for (const registration of registrations) {
      try {
        const checkInUrl = `${baseUrl}/check-in/${registration.check_in_token}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`;

        // Generate certificate if email_type is certificate
        let certificateImageHtml = "";
        if (email_type === "certificate") {
          console.log(`Generating certificate for ${registration.full_name}...`);
          const certificateBase64 = await generateCertificate(
            registration.full_name,
            event.title,
            eventDateFormatted
          );
          
          if (certificateBase64) {
            certificateImageHtml = `
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px;">
                <h3 style="color: #92400e; margin-bottom: 15px;">🎓 เกียรติบัตรของคุณ</h3>
                <img src="${certificateBase64}" alt="Certificate" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" />
                <p style="font-size: 12px; color: #78716c; margin-top: 15px;">
                  คลิกขวาที่รูปภาพแล้วเลือก "Save Image As..." เพื่อบันทึกเกียรติบัตร
                </p>
              </div>
            `;
          } else {
            certificateImageHtml = `
              <div style="text-align: center; margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 10px;">
                <p style="color: #92400e;">⚠️ ไม่สามารถสร้างเกียรติบัตรได้ในขณะนี้ กรุณาติดต่อผู้จัดงาน</p>
              </div>
            `;
          }
        }

        // Determine header color based on email type
        let headerGradient = "linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)";
        let headerIcon = "";
        if (email_type === "news") {
          headerGradient = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
          headerIcon = "📢";
        } else if (email_type === "certificate") {
          headerGradient = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
          headerIcon = "🎓";
        } else {
          headerIcon = "🎉";
        }

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${headerGradient}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; }
              .qr-code { max-width: 200px; }
              .message { white-space: pre-wrap; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
              .button { display: inline-block; padding: 12px 24px; background: #e91e8c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p style="font-size: 24px; margin-bottom: 10px;">${headerIcon}</p>
                <h1>SPU AI CLUB</h1>
                <h2>${event.title}</h2>
              </div>
              <div class="content">
                <p>สวัสดีคุณ ${registration.full_name},</p>
                
                <div class="message">${message}</div>
                
                ${certificateImageHtml}
                
                ${include_qr && email_type === "welcome" ? `
                <div class="qr-section">
                  <h3>🎫 QR Code สำหรับ Check-in</h3>
                  <p>แสดง QR Code นี้เพื่อเช็คอินเข้างาน</p>
                  <img src="${qrCodeUrl}" alt="Check-in QR Code" class="qr-code" />
                  <p style="font-size: 12px; color: #666;">หรือใช้ลิงก์: <a href="${checkInUrl}">${checkInUrl}</a></p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/events/${event.slug || event_id}" class="button">ดูรายละเอียดกิจกรรม</a>
                </div>
                
                <div class="footer">
                  <p>© SPU AI CLUB - มหาวิทยาลัยศรีปทุม</p>
                  <p>หากมีข้อสงสัย กรุณาติดต่อเราที่ spuaiclub@spu.ac.th</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SPU AI CLUB <noreply@spuhr.tech>",
            to: [registration.email],
            subject: subject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          throw new Error(`Resend API error: ${errorData}`);
        }

        const emailData = await emailResponse.json();

        results.push({
          registration_id: registration.id,
          email: registration.email,
          status: "sent",
        });

        console.log(`Email sent to ${registration.email}:`, emailData);
      } catch (emailError: any) {
        console.error(`Failed to send email to ${registration.email}:`, emailError);
        errors.push({
          registration_id: registration.id,
          email: registration.email,
          error: emailError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});