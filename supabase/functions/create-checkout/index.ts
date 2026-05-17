import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { planId, interval = "monthly", successUrl, cancelUrl } = await req.json();
    if (!planId) return new Response(JSON.stringify({ error: "planId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

    const { data: plans } = await supabase
      .from("subscription_plans")
      .select("stripe_price_id_monthly, stripe_price_id_yearly, name")
      .eq("id", planId)
      .single();

    const priceId = interval === "yearly" ? plans?.stripe_price_id_yearly : plans?.stripe_price_id_monthly;
    if (!priceId) return new Response(JSON.stringify({ error: "Plan not available" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan_id: planId, interval },
      success_url: successUrl || `${req.headers.get("origin") || "https://matrxe.com"}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin") || "https://matrxe.com"}/dashboard/billing?canceled=true`,
      subscription_data: {
        metadata: { plan_id: planId, user_id: user.id },
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create checkout" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
