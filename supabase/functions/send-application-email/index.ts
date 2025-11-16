import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  to: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  trackingToken: string;
  applicationId?: string;
  cvFilePath?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    console.log("Received email request:", requestData);

    const { to, fullName, position, email, phone, trackingToken, applicationId } = requestData;

    // Validate required fields
    if (!to || !fullName || !position || !email || !phone || !trackingToken) {
      throw new Error("Missing required fields");
    }

    const baseUrl = supabaseUrl.replace('urcywqpdbyrduzfzvvne.supabase.co', 'urcywqpdbyrduzfzvvne.lovableproject.com');
    const trackingUrl = `${baseUrl}/track-application?token=${trackingToken}`;
    const adminUrl = `${baseUrl}/admin`;

    // Queue applicant confirmation email
    const { error: queueError1 } = await supabase
      .from('email_queue')
      .insert({
        template_name: 'application_confirmation',
        recipient_email: to,
        variables: {
          fullName,
          position,
          email,
          phone,
          trackingToken,
          trackingUrl,
        },
      });

    if (queueError1) {
      console.error('Error queuing applicant email:', queueError1);
      throw queueError1;
    }

    // Queue admin notification email
    const adminEmails = ["admin@greenliving.co.th"];
    for (const adminEmail of adminEmails) {
      const { error: queueError2 } = await supabase
        .from('email_queue')
        .insert({
          template_name: 'admin_notification',
          recipient_email: adminEmail,
          variables: {
            fullName,
            position,
            email,
            phone,
            applicationId: applicationId || 'N/A',
            adminUrl,
          },
        });

      if (queueError2) {
        console.error('Error queuing admin email:', queueError2);
      }
    }

    console.log('Emails queued successfully');

    return new Response(
      JSON.stringify({ success: true, message: "Emails queued for sending" }),
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
