import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
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

// Function to replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

// Function to get email template from database
async function getEmailTemplate(templateName: string) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('name', templateName)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching template ${templateName}:`, error);
    return null;
  }

  return data;
}

// Function to send email via Gmail SMTP
async function sendGmailEmail(
  to: string,
  subject: string,
  html: string,
  fromName: string = "Green Living Recruitment"
): Promise<void> {
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 587,
      tls: true,
      auth: {
        username: Deno.env.get("GMAIL_USER")!,
        password: Deno.env.get("GMAIL_APP_PASSWORD")!,
      },
    },
  });

  try {
    await client.send({
      from: `${fromName} <${Deno.env.get("GMAIL_USER")!}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    console.log("Received email request:", requestData);

    const { to, fullName, position, email, phone, trackingToken, applicationId, cvFilePath } = requestData;

    // Validate required fields
    if (!to || !fullName || !position || !email || !phone || !trackingToken) {
      throw new Error("Missing required fields");
    }

    const baseUrl = supabaseUrl.replace('urcywqpdbyrduzfzvvne.supabase.co', 'urcywqpdbyrduzfzvvne.lovableproject.com');
    const trackingUrl = `${baseUrl}/track-application?token=${trackingToken}`;
    const adminUrl = `${baseUrl}/admin`;

    // Send confirmation email to applicant
    const applicantTemplate = await getEmailTemplate('application_confirmation');
    if (applicantTemplate) {
      const applicantVariables = {
        fullName,
        position,
        email,
        phone,
        trackingToken,
        trackingUrl,
      };

      const applicantSubject = replaceVariables(applicantTemplate.subject, applicantVariables);
      const applicantHtml = replaceVariables(applicantTemplate.html_content, applicantVariables);

      await sendGmailEmail(to, applicantSubject, applicantHtml);
      console.log("Applicant confirmation email sent successfully");
    } else {
      console.error("Applicant template not found, using fallback");
      // Fallback email if template not found
      await sendGmailEmail(
        to,
        `ยืนยันการรับใบสมัคร - ${fullName}`,
        `<p>สวัสดีค่ะคุณ ${fullName}</p><p>เราได้รับใบสมัครของคุณแล้ว ติดตามสถานะได้ที่: ${trackingUrl}</p>`
      );
    }

    // Send notification email to admin
    const adminEmails = ["admin@greenliving.co.th"]; // Get from env or database
    const adminTemplate = await getEmailTemplate('admin_notification');
    
    if (adminTemplate) {
      const adminVariables = {
        fullName,
        position,
        email,
        phone,
        applicationId: applicationId || 'N/A',
        adminUrl,
      };

      const adminSubject = replaceVariables(adminTemplate.subject, adminVariables);
      const adminHtml = replaceVariables(adminTemplate.html_content, adminVariables);

      for (const adminEmail of adminEmails) {
        await sendGmailEmail(adminEmail, adminSubject, adminHtml, "Green Living System");
      }
      console.log("Admin notification emails sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
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
