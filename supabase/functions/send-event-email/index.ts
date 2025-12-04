import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  event_id: string;
  subject: string;
  message: string;
  recipient_ids?: string[]; // Specific registration IDs, or all if empty
  include_qr?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, subject, message, recipient_ids, include_qr }: EmailRequest = await req.json();

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

    for (const registration of registrations) {
      try {
        const checkInUrl = `${baseUrl}/check-in/${registration.check_in_token}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #e91e8c 0%, #c2185b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
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
                <h1>SPU AI CLUB</h1>
                <h2>${event.title}</h2>
              </div>
              <div class="content">
                <p>สวัสดีคุณ ${registration.full_name},</p>
                
                <div class="message">${message}</div>
                
                ${include_qr ? `
                <div class="qr-section">
                  <h3>🎫 QR Code สำหรับ Check-in</h3>
                  <p>แสดง QR Code นี้เพื่อเช็คอินเข้างาน</p>
                  <img src="${qrCodeUrl}" alt="Check-in QR Code" class="qr-code" />
                  <p style="font-size: 12px; color: #666;">หรือใช้ลิงก์: <a href="${checkInUrl}">${checkInUrl}</a></p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/events/${event_id}" class="button">ดูรายละเอียดกิจกรรม</a>
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
