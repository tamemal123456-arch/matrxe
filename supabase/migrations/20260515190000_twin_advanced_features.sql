-- MATRXe: Twin Advanced Features
-- Tables: twin_ai_connections, twin_connections, twin_api_tokens
-- Adds: public_discovery, allow_auto_connect to digital_twins

-- 1. Add new columns to digital_twins
ALTER TABLE public.digital_twins
  ADD COLUMN IF NOT EXISTS public_discovery BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_auto_connect BOOLEAN DEFAULT false;

-- 2. twin_ai_connections - External AI provider connections per twin
CREATE TABLE IF NOT EXISTS public.twin_ai_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  custom_endpoint TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. twin_connections - Twin-to-twin networking
CREATE TABLE IF NOT EXISTS public.twin_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  connected_twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  permissions TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT different_twins CHECK (twin_id <> connected_twin_id),
  UNIQUE(twin_id, connected_twin_id)
);

-- 4. twin_api_tokens - API tokens for external access to twins
CREATE TABLE IF NOT EXISTS public.twin_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  token_preview TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{chat}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_twin_ai_connections_twin_id ON public.twin_ai_connections(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_ai_connections_user_id ON public.twin_ai_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_connections_twin_id ON public.twin_connections(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_connections_connected ON public.twin_connections(connected_twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_api_tokens_twin_id ON public.twin_api_tokens(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_api_tokens_user_id ON public.twin_api_tokens(user_id);

-- 6. RLS: twin_ai_connections
ALTER TABLE public.twin_ai_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own twin AI connections"
  ON public.twin_ai_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own twin AI connections"
  ON public.twin_ai_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own twin AI connections"
  ON public.twin_ai_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own twin AI connections"
  ON public.twin_ai_connections FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS: twin_connections
ALTER TABLE public.twin_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections involving their twins"
  ON public.twin_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.twin_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.connected_twin_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert connections from their twins"
  ON public.twin_connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.twin_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update connections involving their twins"
  ON public.twin_connections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.twin_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.connected_twin_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete connections from their twins"
  ON public.twin_connections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.digital_twins
      WHERE id = twin_connections.twin_id AND user_id = auth.uid()
    )
  );

-- 8. RLS: twin_api_tokens
ALTER TABLE public.twin_api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own twin API tokens"
  ON public.twin_api_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own twin API tokens"
  ON public.twin_api_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own twin API tokens"
  ON public.twin_api_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own twin API tokens"
  ON public.twin_api_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_twin_ai_connections_updated_at
  BEFORE UPDATE ON public.twin_ai_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_twin_connections_updated_at
  BEFORE UPDATE ON public.twin_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_twin_api_tokens_updated_at
  BEFORE UPDATE ON public.twin_api_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
