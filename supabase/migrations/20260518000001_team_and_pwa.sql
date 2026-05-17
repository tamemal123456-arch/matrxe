-- Team Management + Custom Domains + PWA settings

-- 1. Team Management
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 10,
  plan_id TEXT REFERENCES public.subscription_plans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "المالك يدير الفريق" ON public.teams FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "أعضاء الفريق يقرؤون" ON public.teams FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = id)
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'declined')),
  invited_by UUID REFERENCES auth.users(id),
  permissions JSONB DEFAULT '{"can_create_twins": true, "can_manage_api": false, "can_manage_billing": false, "can_invite": false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "أعضاء الفريق يديرون العضوية" ON public.team_members FOR SELECT USING (
  user_id = auth.uid() OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);
CREATE POLICY "المالك يدير الأعضاء" ON public.team_members FOR INSERT WITH CHECK (
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

-- 2. Team Invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "المالك يدير الدعوات" ON public.team_invitations FOR ALL USING (
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

-- 3. Custom Domains per twin
CREATE TABLE IF NOT EXISTS public.twin_custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  verified BOOLEAN NOT NULL DEFAULT false,
  ssl_provisioned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);
ALTER TABLE public.twin_custom_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "المستخدم يدير نطاقات توأمه" ON public.twin_custom_domains FOR ALL USING (
  twin_id IN (SELECT id FROM public.digital_twins WHERE user_id = auth.uid())
);

-- 4. Realtime Chat Presence
CREATE TABLE IF NOT EXISTS public.chat_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'typing', 'offline')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "الجميع يرى الحضور" ON public.chat_presence FOR SELECT USING (true);
CREATE POLICY "المستخدم يحدث حضوره" ON public.chat_presence FOR INSERT OR UPDATE USING (auth.uid() = user_id);

-- 5. Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
