
-- 1. Remove self-write policies on user_subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

-- 2. Constrain plan_id and status to known values
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_check;
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_check
  CHECK (plan_id IN ('free','pro','enterprise'));

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_status_check
  CHECK (status IN ('active','canceled','expired','past_due'));

-- 3. Auto-create a free subscription for every new user via trigger (SECURITY DEFINER, fixed plan)
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- 4. Backfill missing free subscriptions for existing users
INSERT INTO public.user_subscriptions (user_id, plan_id, status)
SELECT u.id, 'free', 'active'
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL;

-- 5. Lock down SECURITY DEFINER trigger functions (not callable via PostgREST)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_default_subscription() FROM PUBLIC, anon, authenticated;
