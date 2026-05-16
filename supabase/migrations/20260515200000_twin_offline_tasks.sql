-- MATRXe: Twin Offline Tasks + File Upload Support
-- Tables: twin_offline_tasks

-- 1. twin_offline_tasks - Background tasks that run after logout
CREATE TABLE IF NOT EXISTS public.twin_offline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('learning', 'analysis', 'maintenance', 'report', 'custom')),
  schedule TEXT NOT NULL DEFAULT 'daily' CHECK (schedule IN ('realtime', 'hourly', 'daily', 'weekly', 'custom')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. twin_messages_attachments - Files attached to messages
CREATE TABLE IF NOT EXISTS public.twin_message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_twin_offline_tasks_twin_id ON public.twin_offline_tasks(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_offline_tasks_user_id ON public.twin_offline_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_offline_tasks_active ON public.twin_offline_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_twin_message_attachments_message_id ON public.twin_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_twin_message_attachments_twin_id ON public.twin_message_attachments(twin_id);

-- 4. RLS: twin_offline_tasks
ALTER TABLE public.twin_offline_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own twin offline tasks"
  ON public.twin_offline_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own twin offline tasks"
  ON public.twin_offline_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own twin offline tasks"
  ON public.twin_offline_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own twin offline tasks"
  ON public.twin_offline_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS: twin_message_attachments
ALTER TABLE public.twin_message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message attachments"
  ON public.twin_message_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message attachments"
  ON public.twin_message_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own message attachments"
  ON public.twin_message_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Trigger for updated_at
CREATE TRIGGER set_twin_offline_tasks_updated_at
  BEFORE UPDATE ON public.twin_offline_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
