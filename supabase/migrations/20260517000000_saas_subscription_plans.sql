-- SaaS Subscription Plans & Feature Gating
-- تشغيل هذا الملف في Supabase SQL Editor بعد الترحيلات السابقة

-- 1. جداول الخطط
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الكل يستطيع قراءة الخطط"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- 2. تحديث user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- 3. إدخال الخطط الافتراضية
INSERT INTO public.subscription_plans (id, name, name_ar, description, price_monthly, price_yearly, sort_order, features, limits) VALUES
  ('free', 'Free', 'مجاني', 'مثالي للتجربة', 0, 0, 1,
    '{"voice_cloning": false, "talking_video": false, "advanced_analytics": false, "api_access": false, "priority_support": false, "custom_branding": false, "team_management": false}',
    '{"max_twins": 1, "max_messages_monthly": 100, "max_voice_samples": 3, "max_storage_mb": 100, "max_api_calls_daily": 0}'),
  ('pro', 'Pro', 'احترافي', 'للاستخدام الشخصي والمهني', 49, 490, 2,
    '{"voice_cloning": true, "talking_video": true, "advanced_analytics": true, "api_access": false, "priority_support": true, "custom_branding": false, "team_management": false}',
    '{"max_twins": 5, "max_messages_monthly": 5000, "max_voice_samples": 20, "max_storage_mb": 1024, "max_api_calls_daily": 0}'),
  ('enterprise', 'Enterprise', 'مؤسسات', 'للفرق والشركات', 199, 1990, 3,
    '{"voice_cloning": true, "talking_video": true, "advanced_analytics": true, "api_access": true, "priority_support": true, "custom_branding": true, "team_management": true}',
    '{"max_twins": -1, "max_messages_monthly": -1, "max_voice_samples": -1, "max_storage_mb": 10240, "max_api_calls_daily": 10000}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits;

-- 4. تعيين الخطة المجانية للمستخدمين الحاليين (إذا لم يكن لديهم خطة)
UPDATE public.user_subscriptions
SET plan_id = 'free'
WHERE plan_id IS NULL;

-- 5. إنشاء دالة لجلب خطة المستخدم مع الميزات
CREATE OR REPLACE FUNCTION public.get_user_plan_features(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id TEXT;
  v_plan_features JSONB;
  v_plan_limits JSONB;
BEGIN
  SELECT COALESCE(us.plan_id, 'free') INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  SELECT sp.features, sp.limits INTO v_plan_features, v_plan_limits
  FROM public.subscription_plans sp
  WHERE sp.id = v_plan_id;

  IF v_plan_features IS NULL THEN
    SELECT features, limits INTO v_plan_features, v_plan_limits
    FROM public.subscription_plans WHERE id = 'free';
  END IF;

  RETURN jsonb_build_object(
    'plan_id', v_plan_id,
    'features', v_plan_features,
    'limits', v_plan_limits
  );
END;
$$;

-- 6. إنشاء دالة للتحقق من الحدود
CREATE OR REPLACE FUNCTION public.check_usage_limit(p_user_id UUID, p_limit_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id TEXT;
  v_limit_value INTEGER;
  v_current_usage INTEGER;
  v_plan_limits JSONB;
BEGIN
  SELECT COALESCE(us.plan_id, 'free') INTO v_plan_id
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  SELECT limits INTO v_plan_limits
  FROM public.subscription_plans
  WHERE id = v_plan_id;

  v_limit_value := COALESCE((v_plan_limits->>p_limit_key)::INTEGER, 0);

  SELECT COALESCE((us.usage_stats->>p_limit_key)::INTEGER, 0) INTO v_current_usage
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  IF v_limit_value = -1 THEN
    RETURN jsonb_build_object('allowed', true, 'limit', -1, 'usage', v_current_usage, 'remaining', -1);
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_current_usage < v_limit_value,
    'limit', v_limit_value,
    'usage', v_current_usage,
    'remaining', GREATEST(v_limit_value - v_current_usage, 0)
  );
END;
$$;

-- 7. إنشاء دالة لتسجيل الاستخدام
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID, p_usage_key TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET usage_stats = COALESCE(usage_stats, '{}'::JSONB) ||
    jsonb_build_object(p_usage_key, COALESCE((usage_stats->>p_usage_key)::INTEGER, 0) + 1)
  WHERE user_id = p_user_id;
END;
$$;

-- 8. إعادات الترقيم الشهرية (جوب - سيتم استدعاؤها يدوياً أو عن طريق pg_cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET usage_stats = '{}'::JSONB;
END;
$$;
