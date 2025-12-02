import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
const LINE_NOTIFY_TO = Deno.env.get("LINE_NOTIFY_TO"); // User ID or Group ID

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LineNotificationRequest {
  type: "new_application" | "status_change" | "broadcast";
  applicantName?: string;
  email?: string;
  phone?: string;
  position?: string;
  oldStatus?: string;
  newStatus?: string;
  applicationId?: string;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
    }

    if (!LINE_NOTIFY_TO) {
      throw new Error("LINE_NOTIFY_TO (User ID or Group ID) is not configured");
    }

    const body: LineNotificationRequest = await req.json();
    console.log("📱 Sending LINE notification:", body);

    let message = "";
    let endpoint = "";
    let requestBody: any = {};

    if (body.type === "broadcast") {
      // Broadcast message to all followers
      message = body.customMessage || "📢 ประกาศจากทีม SPU AI CLUB";
      endpoint = "https://api.line.me/v2/bot/message/broadcast";
      requestBody = {
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    } else {
      // Push message to specific user/group
      if (!LINE_NOTIFY_TO) {
        console.warn("LINE_NOTIFY_TO not configured, skipping push notification");
        return new Response(
          JSON.stringify({ success: false, message: "LINE_NOTIFY_TO not configured" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (body.type === "new_application") {
        message = `🎉 ใบสมัครใหม่!\n\n` +
          `👤 ชื่อ: ${body.applicantName}\n` +
          `📧 อีเมล: ${body.email}\n` +
          (body.phone ? `📱 เบอร์: ${body.phone}\n` : "") +
          (body.position ? `💼 ตำแหน่ง: ${body.position}\n` : "") +
          `\nกรุณาเข้าไปตรวจสอบใน Admin Dashboard`;
      } else if (body.type === "status_change") {
        const statusEmoji: Record<string, string> = {
          pending: "⏳",
          reviewing: "👀",
          accepted: "✅",
          rejected: "❌",
        };

        message = `📝 อัปเดตสถานะใบสมัคร\n\n` +
          `👤 ชื่อ: ${body.applicantName}\n` +
          `📧 อีเมล: ${body.email}\n` +
          (body.position ? `💼 ตำแหน่ง: ${body.position}\n` : "") +
          `\n${statusEmoji[body.oldStatus || ""] || "📌"} สถานะเดิม: ${body.oldStatus}\n` +
          `${statusEmoji[body.newStatus || ""] || "📌"} สถานะใหม่: ${body.newStatus}`;
      }

      endpoint = "https://api.line.me/v2/bot/message/push";
      requestBody = {
        to: LINE_NOTIFY_TO,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    }

    // Send LINE Message
    const lineResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      console.error("LINE API Error:", errorText);
      throw new Error(`LINE API Error: ${lineResponse.status} - ${errorText}`);
    }

    console.log("✅ LINE notification sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "LINE notification sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error sending LINE notification:", error);
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
