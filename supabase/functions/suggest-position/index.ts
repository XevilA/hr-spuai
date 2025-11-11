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
    const { fullName, faculty, major, universityYear, interestsSkills, motivation } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch available positions
    const { data: positions, error: positionsError } = await supabaseAdmin
      .from("positions")
      .select("id, title, description, requirements, responsibilities")
      .eq("is_active", true);

    if (positionsError) throw positionsError;

    if (!positions || positions.length === 0) {
      return new Response(
        JSON.stringify({ suggestion: null, reason: "No positions available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to analyze and suggest best position
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const positionsText = positions.map((p, i) => 
      `${i + 1}. ${p.title}\n   Description: ${p.description}\n   Requirements: ${p.requirements}`
    ).join("\n\n");

    const prompt = `Based on the following applicant information, suggest the MOST suitable position (return only the position number 1-${positions.length}):

Applicant Profile:
- Name: ${fullName}
- Faculty: ${faculty}
- Major: ${major}
- Year: ${universityYear}
- Interests & Skills: ${interestsSkills || "Not specified"}
- Motivation: ${motivation}

Available Positions:
${positionsText}

Analyze the applicant's background, interests, skills, and motivation, then return ONLY the number of the most suitable position (1-${positions.length}). Consider their major, year level, technical skills, and interests expressed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a recruitment assistant. Analyze applicant profiles and suggest the best matching position. Return ONLY the position number."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ suggestion: null, reason: "AI service unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const suggestion = aiData.choices[0]?.message?.content?.trim();
    
    // Extract number from suggestion
    const positionIndex = parseInt(suggestion) - 1;
    
    if (positionIndex >= 0 && positionIndex < positions.length) {
      const suggestedPosition = positions[positionIndex];
      return new Response(
        JSON.stringify({
          suggestion: {
            id: suggestedPosition.id,
            title: suggestedPosition.title,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to first position if AI response is invalid
    return new Response(
      JSON.stringify({
        suggestion: {
          id: positions[0].id,
          title: positions[0].title,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-position:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
