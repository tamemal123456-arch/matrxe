-- Add tier, provider, usage tracking to user_api_keys
ALTER TABLE public.user_api_keys
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'openrouter',
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
  ADD COLUMN IF NOT EXISTS monthly_limit INTEGER,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Index for fast key lookup
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active
  ON public.user_api_keys (user_id, service_name, tier, is_active)
  WHERE is_active = true;

-- Admin-only functions for key management
CREATE OR REPLACE FUNCTION public.get_all_api_keys(admin_uid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  service_name TEXT,
  provider TEXT,
  tier TEXT,
  is_active BOOLEAN,
  usage_count INTEGER,
  monthly_limit INTEGER,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_uid AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
  SELECT
    k.id, k.user_id, u.email::TEXT, k.service_name, k.provider, k.tier,
    k.is_active, k.usage_count, k.monthly_limit, k.last_used_at, k.created_at
  FROM public.user_api_keys k
  LEFT JOIN auth.users u ON u.id = k.user_id
  ORDER BY k.last_used_at DESC NULLS LAST;
END;
$$;

-- Admin function to reset usage counter
CREATE OR REPLACE FUNCTION public.reset_key_usage(admin_uid UUID, key_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_uid AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.user_api_keys SET usage_count = 0, updated_at = now() WHERE id = key_id;
END;
$$;

-- Admin function to upsert any key
CREATE OR REPLACE FUNCTION public.upsert_api_key(
  admin_uid UUID,
  p_user_id UUID,
  p_service_name TEXT,
  p_provider TEXT,
  p_tier TEXT,
  p_api_key_encrypted TEXT,
  p_base_url TEXT DEFAULT NULL,
  p_monthly_limit INTEGER DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_uid AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.user_api_keys (user_id, service_name, provider, tier, api_key_encrypted, base_url, monthly_limit, is_active)
  VALUES (p_user_id, p_service_name, p_provider, p_tier, p_api_key_encrypted, p_base_url, p_monthly_limit, p_is_active)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION public.get_all_api_keys TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_key_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_api_key TO authenticated;
