import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Fetch available positions
    const { data: positions } = await supabaseClient
      .from("positions")
      .select("*")
      .eq("is_active", true);

    const positionsContext = positions?.map(p => 
      `ตำแหน่ง: ${p.title}\nรายละเอียด: ${p.description}\nคุณสมบัติ: ${p.requirements}\nความรับผิดชอบ: ${p.responsibilities}`
    ).join("\n\n") || "ยังไม่มีตำแหน่งเปิดรับสมัคร";

    const systemPrompt = `คุณคือน้องกรีน (Nong Green) AI Assistant ของชมรม HR@SPU AI CLUB 
คุณเป็นผู้ช่วยที่เป็นมิตร พูดภาษาไทยอย่างสุภาพและเป็นกันเอง
คุณให้คำปรึกษาเกี่ยวกับตำแหน่งงานต่างๆ ในชมรม โดยอ้างอิงจากข้อมูลต่อไปนี้:

ตำแหน่งที่เปิดรับสมัคร:
${positionsContext}

งานของคุณคือ:
1. แนะนำตำแหน่งงานที่เหมาะสมกับผู้สนใจ
2. ตอบคำถามเกี่ยวกับคุณสมบัติและความรับผิดชอบของแต่ละตำแหน่ง
3. ให้คำแนะนำในการเตรียมตัวสมัคร
4. อธิบายเส้นทางการเติบโตในแต่ละตำแหน่ง

พูดแบบเป็นกันเอง ใช้ "ฉัน" และ "คุณ" และเติม "ค่ะ/ครับ" ที่เหมาะสม`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            message: "ขออภัยค่ะ ขณะนี้มีผู้ใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งในอีกสักครู่ค่ะ" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in green-chatbot:", error);
    return new Response(
      JSON.stringify({ 
        message: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
