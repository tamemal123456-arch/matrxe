-- Add voice_id column to store cloned voice ID from ElevenLabs
ALTER TABLE public.digital_twins 
ADD COLUMN voice_id TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.digital_twins.voice_id IS 'ElevenLabs cloned voice ID for the digital twin';