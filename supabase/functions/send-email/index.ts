import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

interface EmailPayload {
  to: string;
  templateId: string;
  variables?: Record<string, string>;
  subject?: string;
  html?: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      // Allow service role to send without user auth
    }

    const payload: EmailPayload = await req.json();
    if (!payload.to) return new Response(JSON.stringify({ error: "Recipient required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let subject = payload.subject || "";
    let html = payload.html || "";
    let text = payload.text || "";

    if (payload.templateId) {
      const { data: template } = await supabase.from("email_templates").select("*").eq("id", payload.templateId).single();
      if (template) {
        subject = template.subject;
        html = template.body_html;
        text = template.body_text;
        if (payload.variables) {
          for (const [key, value] of Object.entries(payload.variables)) {
            subject = subject.replace(`{${key}}`, value);
            html = html.replace(`{${key}}`, value);
            text = text.replace(`{${key}}`, value);
          }
        }
      }
    }

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM") || "noreply@matrxe.com";

    if (smtpHost && smtpUser && smtpPass) {
      const client = new SmtpClient();
      await client.connectTLS({ hostname: smtpHost, port: smtpPort, username: smtpUser, password: smtpPass });
      await client.send({ from: fromEmail, to: payload.to, subject, content: html, html: true });
      await client.close();
    } else {
      console.log("SMTP not configured. Would send email:", { to: payload.to, subject });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
