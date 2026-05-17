import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { exportType = "full" } = await req.json();

    const exportData: Record<string, any> = { exported_at: new Date().toISOString(), user_id: user.id, email: user.email };

    if (exportType === "full" || exportType === "twins") {
      const { data: twins } = await supabase.from("digital_twins").select("*").eq("user_id", user.id);
      exportData.digital_twins = twins;
    }
    if (exportType === "full" || exportType === "messages") {
      const { data: conversations } = await supabase.from("conversations").select("*, chat_messages(*)").eq("user_id", user.id);
      exportData.conversations = conversations;
    }
    if (exportType === "full" || exportType === "api_keys") {
      const { data: apiKeys } = await supabase.from("user_api_keys").select("service_name, provider, tier, is_active, created_at").eq("user_id", user.id);
      exportData.api_keys = apiKeys;
    }
    if (exportType === "full") {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      exportData.profile = profile;
      const { data: memories } = await supabase.from("twin_memories").select("*").eq("user_id", user.id);
      exportData.memories = memories;
    }

    const json = JSON.stringify(exportData, null, 2);
    const fileName = `matrxe-export-${user.id.slice(0, 8)}-${Date.now()}.json`;

    const { data: upload, error: uploadError } = await supabase.storage.from("twin-images").upload(`exports/${user.id}/${fileName}`, json, { contentType: "application/json", upsert: false });
    if (uploadError) return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: urlData } = supabase.storage.from("twin-images").getPublicUrl(`exports/${user.id}/${fileName}`);

    await supabase.from("export_requests").insert({
      user_id: user.id, status: "completed", export_type: exportType,
      file_url: urlData?.publicUrl, expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      completed_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, url: urlData?.publicUrl, fileName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Export failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
