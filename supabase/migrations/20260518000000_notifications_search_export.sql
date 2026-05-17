-- Notifications, Search, Rate Limiting, Data Export

-- 1. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'system', 'message', 'twin', 'team', 'billing')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE POLICY "المستخدم يرى إشعاراته فقط" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 2. Search (full-text)
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_conversations_search ON public.conversations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_messages_search ON public.chat_messages USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.update_conversation_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_message_search() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversation_search ON public.conversations;
CREATE TRIGGER trg_conversation_search BEFORE INSERT OR UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_conversation_search();
DROP TRIGGER IF EXISTS trg_message_search ON public.chat_messages;
CREATE TRIGGER trg_message_search BEFORE INSERT OR UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_message_search();

-- 3. Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  max_requests INTEGER NOT NULL DEFAULT 60,
  window_seconds INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(user_id, endpoint, window_start);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID, p_endpoint TEXT,
  p_max INTEGER DEFAULT 60, p_window_seconds INTEGER DEFAULT 60
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
  v_window TIMESTAMPTZ;
BEGIN
  v_window := date_trunc('second', now()) - (p_window_seconds || ' seconds')::INTERVAL;
  DELETE FROM public.rate_limits WHERE window_start < v_window;
  SELECT SUM(request_count) INTO v_count FROM public.rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint AND window_start > v_window;
  IF v_count IS NULL THEN v_count := 0; END IF;
  IF v_count >= p_max THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'reset_in', p_window_seconds);
  END IF;
  INSERT INTO public.rate_limits (user_id, endpoint, request_count, max_requests, window_seconds)
    VALUES (p_user_id, p_endpoint, 1, p_max, p_window_seconds);
  RETURN jsonb_build_object('allowed', true, 'remaining', p_max - v_count - 1, 'reset_in', p_window_seconds);
END;
$$;

-- 4. Data Export Requests
CREATE TABLE IF NOT EXISTS public.export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_type TEXT NOT NULL DEFAULT 'full' CHECK (export_type IN ('full', 'messages', 'twins', 'api_keys')),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "المستخدم يرى طلبات تصديره" ON public.export_requests
  FOR ALL USING (auth.uid() = user_id);

-- 5. Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.email_templates (id, subject, body_html, body_text, variables) VALUES
  ('welcome', 'مرحباً بك في ماترِكسي!', '<h1>مرحباً بك!</h1><p>شكراً لانضمامك إلى ماترِكسي. ابدأ بإنشاء توأمك الرقمي الأول.</p>', 'مرحباً بك! شكراً لانضمامك إلى ماترِكسي.', ARRAY['user_name']),
  ('subscription_success', 'تم تفعيل اشتراكك', '<h1>تم التفعيل</h1><p>خطتك {plan_name} نشطة الآن.</p>', 'خطتك نشطة الآن.', ARRAY['user_name', 'plan_name']),
  ('subscription_expiring', 'اشتراكك على وشك الانتهاء', '<h1>تنبيه</h1><p>اشتراكك سينتهي في {days} أيام.</p>', 'اشتراكك سينتهي قريباً.', ARRAY['user_name', 'days']),
  ('export_ready', 'ملف التصدير جاهز', '<h1>جاهز</h1><p>ملف تصدير بياناتك جاهز للتحميل.</p>', 'ملف التصدير جاهز.', ARRAY['user_name'])
ON CONFLICT (id) DO NOTHING;
