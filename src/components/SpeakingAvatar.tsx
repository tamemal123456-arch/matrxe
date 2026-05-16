// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion, AnimatePresence } from "framer-motion";

interface SpeakingAvatarProps {
  avatarUrl: string | null;
  isPlaying: boolean;
  audioLevels: number[];
  averageLevel: number;
  size?: "sm" | "md" | "lg";
}

const SpeakingAvatar = ({
  avatarUrl,
  isPlaying,
  audioLevels,
  averageLevel,
  size = "lg",
}: SpeakingAvatarProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const ringScales = {
    sm: [1.3, 1.5],
    md: [1.35, 1.55],
    lg: [1.4, 1.6],
  };

  // Calculate dynamic scale based on audio level
  const dynamicScale = isPlaying ? 1 + averageLevel * 0.15 : 1;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Main Avatar Container */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden shadow-2xl`}
        animate={{
          scale: dynamicScale,
          boxShadow: isPlaying
            ? `0 0 ${30 + averageLevel * 40}px ${10 + averageLevel * 20}px hsl(var(--accent) / ${0.3 + averageLevel * 0.4})`
            : "0 0 20px 5px hsl(var(--primary) / 0.2)",
        }}
        transition={{
          scale: { duration: 0.05, ease: "linear" },
          boxShadow: { duration: 0.1 },
        }}
        style={{
          border: isPlaying
            ? `3px solid hsl(var(--accent))`
            : `3px solid hsl(var(--primary) / 0.5)`,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
        )}

        {/* Glow overlay when speaking */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.2 + averageLevel * 0.5,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
              className="absolute inset-0 bg-gradient-to-t from-accent/50 via-transparent to-primary/30 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Speaking Indicator Rings */}
      <AnimatePresence>
        {isPlaying && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{
                scale: ringScales[size][0] + averageLevel * 0.3,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
              className={`absolute ${sizeClasses[size]} rounded-full border-4 border-accent/60`}
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: ringScales[size][1] + averageLevel * 0.2,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.2,
              }}
              className={`absolute ${sizeClasses[size]} rounded-full border-4 border-primary/50`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Audio Bars Animation - synced with actual audio levels */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-0.5"
          >
            {audioLevels.map((level, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-accent to-primary rounded-full"
                animate={{
                  height: `${Math.max(4, level * 32)}px`,
                }}
                transition={{
                  duration: 0.05,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeakingAvatar;
