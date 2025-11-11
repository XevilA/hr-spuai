import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, fullName }: EmailRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HR@SPU AI CLUB <onboarding@resend.dev>",
        to: [to],
        subject: "ขอบคุณสำหรับการสมัครเข้าชมรม HR@SPU AI CLUB",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">สวัสดีค่ะคุณ ${fullName}!</h1>
            <p>ขอบคุณที่สนใจสมัครเข้าร่วมชมรม HR@SPU AI CLUB</p>
            <p>เราได้รับใบสมัครของคุณเรียบร้อยแล้ว ทีมงานของเราจะทำการพิจารณาและติดต่อกลับไปในเร็วๆ นี้</p>
            <p>หากมีคำถามเพิ่มเติม สามารถสอบถามได้ผ่านทาง AI Chatbot "น้องกรีน" บนเว็บไซต์ของเรา</p>
            <br>
            <p>ด้วยความเคารพ,<br>ทีม HR@SPU AI CLUB</p>
          </div>
        `,
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
