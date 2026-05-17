import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = customer.id;
      await supabase.from("user_subscriptions").upsert({ user_id: user.id, stripe_customer_id: customer.id }, { onConflict: "user_id" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get("origin") || "https://matrxe.com"}/dashboard/billing`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create portal session" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
