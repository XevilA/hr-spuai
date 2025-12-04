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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, action } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get registration by token
    const { data: registration, error: regError } = await supabase
      .from("event_registrations")
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          end_date,
          location
        )
      `)
      .eq("check_in_token", token)
      .single();

    if (regError || !registration) {
      return new Response(JSON.stringify({ error: "Invalid check-in token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If just verifying (GET info)
    if (action === "verify") {
      return new Response(JSON.stringify({
        success: true,
        registration: {
          id: registration.id,
          full_name: registration.full_name,
          email: registration.email,
          participant_type: registration.participant_type,
          checked_in: !!registration.checked_in_at,
          checked_in_at: registration.checked_in_at,
        },
        event: registration.events,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already checked in
    if (registration.checked_in_at) {
      return new Response(JSON.stringify({
        success: false,
        error: "Already checked in",
        checked_in_at: registration.checked_in_at,
        registration: {
          id: registration.id,
          full_name: registration.full_name,
          email: registration.email,
        },
        event: registration.events,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Perform check-in
    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: new Date().toISOString(),
        status: "checked_in",
      })
      .eq("id", registration.id);

    if (updateError) {
      throw new Error("Failed to update check-in status");
    }

    console.log(`Check-in successful for ${registration.full_name} (${registration.email})`);

    return new Response(JSON.stringify({
      success: true,
      message: "Check-in successful!",
      registration: {
        id: registration.id,
        full_name: registration.full_name,
        email: registration.email,
        participant_type: registration.participant_type,
      },
      event: registration.events,
      checked_in_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Check-in error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
