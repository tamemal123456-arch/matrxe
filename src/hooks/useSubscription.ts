import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface PlanFeatures {
  voice_cloning: boolean;
  talking_video: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  priority_support: boolean;
  custom_branding: boolean;
  team_management: boolean;
}

export interface PlanLimits {
  max_twins: number;
  max_messages_monthly: number;
  max_voice_samples: number;
  max_storage_mb: number;
  max_api_calls_daily: number;
}

export interface Plan {
  id: string;
  name: string;
  name_ar: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeatures;
  limits: PlanLimits;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  billing_interval: string;
  current_period_end: string | null;
  usage_stats: Record<string, number>;
}

const FREE_PLAN: Plan = {
  id: "free",
  name: "Free", name_ar: "مجاني",
  price_monthly: 0, price_yearly: 0,
  features: { voice_cloning: false, talking_video: false, advanced_analytics: false, api_access: false, priority_support: false, custom_branding: false, team_management: false },
  limits: { max_twins: 1, max_messages_monthly: 100, max_voice_samples: 3, max_storage_mb: 100, max_api_calls_daily: 0 },
};

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan>(FREE_PLAN);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setPlan(FREE_PLAN); setLoading(false); return; }
    try {
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setSubscription(subData);

      const planId = subData?.plan_id || "free";
      const { data: planData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      setPlan(planData || FREE_PLAN);
    } catch { setPlan(FREE_PLAN); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const canAccess = (feature: keyof PlanFeatures): boolean => {
    return plan?.features?.[feature] === true;
  };

  const getLimit = (limit: keyof PlanLimits): number => {
    const val = plan?.limits?.[limit];
    return val === -1 ? Infinity : (val ?? 0);
  };

  const getUsage = (key: string): number => {
    return subscription?.usage_stats?.[key] || 0;
  };

  const isAtLimit = (limit: keyof PlanLimits): boolean => {
    const max = getLimit(limit);
    if (max === Infinity) return false;
    return getUsage(limit) >= max;
  };

  const remaining = (limit: keyof PlanLimits): number => {
    const max = getLimit(limit);
    if (max === Infinity) return Infinity;
    return Math.max(0, max - getUsage(limit));
  };

  const createCheckout = async (planId: string, interval = "monthly") => {
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" }); return; }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast({ title: "خطأ", description: "فشل إنشاء جلسة الدفع", variant: "destructive" });
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال بخادم الدفع", variant: "destructive" });
    } finally { setCheckoutLoading(false); }
  };

  const openPortal = async () => {
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setCheckoutLoading(false); }
  };

  const currentPlan = plan?.id || "free";
  const isPaidPlan = currentPlan !== "free";

  return {
    subscription, plan, loading, currentPlan, isPaidPlan, checkoutLoading,
    canAccess, getLimit, getUsage, isAtLimit, remaining,
    createCheckout, openPortal, refetch: fetchSubscription,
  };
}
