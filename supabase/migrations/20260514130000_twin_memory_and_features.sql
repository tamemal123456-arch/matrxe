-- Long-term memory for digital twins
CREATE TABLE public.twin_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'skill', 'conversation_summary', 'learned_knowledge')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  importance INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 10),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twin_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their twin memories"
ON public.twin_memories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their twin memories"
ON public.twin_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their twin memories"
ON public.twin_memories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their twin memories"
ON public.twin_memories FOR DELETE
USING (auth.uid() = user_id);

-- Social media connections
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'instagram', 'linkedin', 'facebook', 'youtube', 'tiktok', 'telegram', 'whatsapp', 'snapchat', 'discord')),
  account_name TEXT NOT NULL,
  account_url TEXT,
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their social connections"
ON public.social_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their social connections"
ON public.social_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their social connections"
ON public.social_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their social connections"
ON public.social_connections FOR DELETE
USING (auth.uid() = user_id);

-- API keys storage
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their API keys"
ON public.user_api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their API keys"
ON public.user_api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their API keys"
ON public.user_api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their API keys"
ON public.user_api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Learned skills from self-training
CREATE TABLE public.twin_learned_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_source TEXT,
  skill_level TEXT DEFAULT 'basic' CHECK (skill_level IN ('basic', 'intermediate', 'advanced', 'master')),
  description TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twin_learned_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their twin skills"
ON public.twin_learned_skills FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their twin skills"
ON public.twin_learned_skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their twin skills"
ON public.twin_learned_skills FOR UPDATE
USING (auth.uid() = user_id);

-- SEO & Marketing campaigns
CREATE TABLE public.twin_marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  twin_id UUID NOT NULL REFERENCES public.digital_twins(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('seo', 'social_media', 'ai_directories', 'search_engines', 'content_marketing')),
  platform TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  content TEXT,
  target_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  result_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.twin_marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their campaigns"
ON public.twin_marketing_campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their campaigns"
ON public.twin_marketing_campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their campaigns"
ON public.twin_marketing_campaigns FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_twin_memories_updated_at
BEFORE UPDATE ON public.twin_memories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
BEFORE UPDATE ON public.social_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_twin_learned_skills_updated_at
BEFORE UPDATE ON public.twin_learned_skills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_twin_marketing_campaigns_updated_at
BEFORE UPDATE ON public.twin_marketing_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
