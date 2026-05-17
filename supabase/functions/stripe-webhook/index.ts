import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const { verifyEvent, STRIPE_SECRET_KEY } = await import("https://esm.sh/stripe@17.7.0?dts");
    if (!STRIPE_SECRET_KEY) return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let event: any;
    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { type, data } = event;

    if (type === "checkout.session.completed") {
      const session = data.object;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;
      const customerId = session.customer;
      const planId = session.metadata?.plan_id || "pro";
      const interval = session.metadata?.interval || "monthly";

      if (userId) {
        await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          plan_id: planId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: "active",
          status: "active",
          billing_interval: interval,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        }, { onConflict: "user_id" });
      }
    }

    if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
      const sub = data.object;
      const customerId = sub.customer;
      const status = sub.status;
      const planId = sub.items?.data?.[0]?.price?.metadata?.plan_id || "free";

      await supabase.from("user_subscriptions")
        .update({
          plan_id: status === "active" || status === "trialing" ? planId : "free",
          stripe_subscription_status: status,
          status: status === "active" || status === "trialing" ? "active" : "canceled",
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        })
        .eq("stripe_customer_id", customerId);
    }

    if (type === "invoice.paid") {
      const invoice = data.object;
      const customerId = invoice.customer;
      await supabase.from("user_subscriptions")
        .update({ status: "active" })
        .eq("stripe_customer_id", customerId);
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Webhook error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
