// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TalkingVideoProps {
  avatarUrl: string;
  twinName?: string;
  voiceId?: string;
  text?: string;
  autoPlay?: boolean;
}

const TalkingVideo = ({
  avatarUrl,
  twinName = "",
  voiceId,
  text,
  autoPlay = false,
}: TalkingVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateTalkingVideo = async () => {
    if (!text || !text.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/talking-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: text.trim(),
            voiceId: voiceId || null,
            avatarImage: avatarUrl,
            language: "ar",
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "فشل إنشاء الفيديو");
      }

      const data = await response.json();
      if (data.video_url) {
        setVideoUrl(data.video_url);
        setIsPlaying(true);
      } else {
        throw new Error("لم يتم استلام رابط الفيديو");
      }
    } catch (err) {
      console.error("Talking video generation error:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Display */}
      <AnimatePresence>
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden glass-card border border-accent/30"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full max-w-md mx-auto"
              autoPlay={autoPlay && isPlaying}
              controls
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <button
              onClick={toggleMute}
              className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-accent" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      {!videoUrl && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateTalkingVideo}
          disabled={isGenerating || !text || !text.trim()}
          className="relative w-full py-4 px-6 rounded-2xl glass-card border border-primary/30 
            bg-gradient-to-br from-primary/10 to-accent/10
            hover:border-primary/60 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center justify-center gap-3">
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="font-medium text-foreground">
                  جارٍ إنشاء الفيديو الناطق...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-primary group-hover:animate-pulse" />
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    تحويل إلى فيديو ناطق
                  </p>
                  <p className="text-xs text-muted-foreground">
                    سيقرأ التوأم النص بصوت طبيعي مع حركة الشفاه
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.button>
      )}

      {/* Error Display */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Regenerate Button */}
      {videoUrl && (
        <button
          onClick={() => {
            setVideoUrl(null);
            setError("");
          }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors mx-auto block"
        >
          إنشاء فيديو جديد
        </button>
      )}
    </div>
  );
};

export default TalkingVideo;
