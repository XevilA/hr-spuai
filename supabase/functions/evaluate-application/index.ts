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
    const { applicationId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch application details with position
    const { data: application, error: appError } = await supabaseClient
      .from("applications")
      .select(`
        *,
        positions (
          title,
          description,
          requirements,
          responsibilities
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError) throw appError;

    const position = application.positions;
    const positionContext = position 
      ? `ตำแหน่งที่สมัคร: ${position.title}
คำอธิบาย: ${position.description}
คุณสมบัติที่ต้องการ: ${position.requirements}
หน้าที่รับผิดชอบ: ${position.responsibilities}`
      : "ไม่ได้ระบุตำแหน่ง";

    const evaluationPrompt = `วิเคราะห์ความเหมาะสมของผู้สมัครต่อไปนี้กับตำแหน่งที่สมัคร:

ข้อมูลผู้สมัคร:
- ชื่อ: ${application.full_name}
- คณะ: ${application.faculty}
- สาขา: ${application.major}
- ปีการศึกษา: ${application.university_year}
- แรงบันดาลใจ: ${application.motivation}
${application.portfolio_url ? `- Portfolio: ${application.portfolio_url}` : ''}

${positionContext}

โปรดวิเคราะห์และให้:
1. เปอร์เซ็นต์ความเหมาะสม (0-100) เทียบกับตำแหน่งที่สมัคร
2. ข้อเสนอแนะสั้นๆ เกี่ยวกับความเหมาะสมและข้อควรพัฒนาสำหรับตำแหน่งนี้โดยเฉพาะ

ตอบกลับในรูปแบบ JSON:
{
  "match_percentage": <number>,
  "evaluation": "<string>"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "คุณเป็น HR AI ที่วิเคราะห์ความเหมาะสมของผู้สมัครงาน ตอบกลับเป็น JSON เท่านั้น" 
          },
          { role: "user", content: evaluationPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Update application with evaluation
    const { error: updateError } = await supabaseClient
      .from("applications")
      .update({
        match_percentage: result.match_percentage,
        ai_evaluation: result.evaluation,
      })
      .eq("id", applicationId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in evaluate-application:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
