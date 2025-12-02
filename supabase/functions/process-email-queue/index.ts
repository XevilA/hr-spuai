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
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  fromName: string = "SPU AI CLUB"
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
    console.log(`✉️ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  } finally {
    await client.close();
  }
}

// Process a single email from queue
async function processEmailQueueItem(queueItem: any) {
  const { id, template_name, recipient_email, variables, retry_count } = queueItem;

  try {
    // Mark as processing
    await supabase
      .from('email_queue')
      .update({ 
        status: 'processing',
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', id);

    // Get template
    const template = await getEmailTemplate(template_name);
    if (!template) {
      throw new Error(`Template ${template_name} not found`);
    }

    // Replace variables in subject and content
    const subject = replaceVariables(template.subject, variables as Record<string, string>);
    const html = replaceVariables(template.html_content, variables as Record<string, string>);

    // Send email
    await sendEmail(recipient_email, subject, html, "SPU AI CLUB");

    // Mark as sent
    await supabase
      .from('email_queue')
      .update({ status: 'sent' })
      .eq('id', id);

    // Log success
    await supabase
      .from('email_logs')
      .insert({
        queue_id: id,
        template_name,
        recipient_email,
        subject,
        status: 'sent',
        retry_attempt: retry_count,
      });

    console.log(`✅ Email sent to ${recipient_email}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${recipient_email}:`, error.message);

    // Update queue item
    const newRetryCount = retry_count + 1;
    const maxRetries = queueItem.max_retries || 3;

    if (newRetryCount >= maxRetries) {
      // Mark as permanently failed
      await supabase
        .from('email_queue')
        .update({ 
          status: 'failed',
          retry_count: newRetryCount,
          error_message: error.message
        })
        .eq('id', id);

      console.log(`🚫 Email to ${recipient_email} permanently failed after ${newRetryCount} attempts`);
    } else {
      // Schedule for retry
      const nextRetryAt = new Date(Date.now() + (newRetryCount * 5 * 60 * 1000)); // 5 min * retry_count
      await supabase
        .from('email_queue')
        .update({ 
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error.message,
          scheduled_at: nextRetryAt.toISOString()
        })
        .eq('id', id);

      console.log(`🔄 Email to ${recipient_email} scheduled for retry at ${nextRetryAt.toISOString()}`);
    }

    // Log failure
    await supabase
      .from('email_logs')
      .insert({
        queue_id: id,
        template_name,
        recipient_email,
        subject: queueItem.template_name,
        status: 'failed',
        error_message: error.message,
        retry_attempt: retry_count,
      });

    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting email queue processing...');

    // Get pending emails that are scheduled to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10); // Process up to 10 emails at a time

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('📭 No pending emails in queue');
      return new Response(
        JSON.stringify({ success: true, message: "No pending emails", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📧 Found ${pendingEmails.length} pending emails to process`);

    // Process emails sequentially to avoid rate limiting
    const results = [];
    for (const email of pendingEmails) {
      const result = await processEmailQueueItem(email);
      results.push(result);
      
      // Add a small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Processed ${pendingEmails.length} emails: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Queue processed",
        processed: pendingEmails.length,
        successful,
        failed
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing email queue:", error);
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
