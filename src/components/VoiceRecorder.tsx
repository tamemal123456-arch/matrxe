// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Pause, Play, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (file: File) => void;
}

const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(5));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isRecording || isPaused) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 frequency bands
    const bands = 20;
    const bandSize = Math.floor(dataArray.length / bands);
    const levels = [];
    
    for (let i = 0; i < bands; i++) {
      let sum = 0;
      for (let j = 0; j < bandSize; j++) {
        sum += dataArray[i * bandSize + j];
      }
      const average = sum / bandSize;
      // Scale to 5-100 range for visual effect
      levels.push(Math.max(5, Math.min(100, (average / 255) * 100)));
    }
    
    setAudioLevels(levels);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start visualization
      updateAudioLevels();

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        updateAudioLevels();
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevels(Array(20).fill(5));
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const saveRecording = () => {
    if (audioBlob) {
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { 
        type: 'audio/webm' 
      });
      onRecordingComplete(file);
      discardRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!audioBlob ? (
          <motion.div
            key="recorder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 border-accent/20"
          >
            {/* Visualizer */}
            <div className="flex items-end justify-center gap-1 h-24 mb-6">
              {audioLevels.map((level, index) => (
                <motion.div
                  key={index}
                  className="w-2 rounded-full bg-gradient-to-t from-accent to-primary"
                  animate={{ 
                    height: `${level}%`,
                    opacity: isRecording && !isPaused ? 1 : 0.3
                  }}
                  transition={{ 
                    duration: 0.05,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <span className={`text-3xl font-mono font-bold ${
                isRecording ? "text-accent" : "text-muted-foreground"
              }`}>
                {formatTime(recordingTime)}
              </span>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 mt-2"
                >
                  <motion.div
                    animate={{ 
                      scale: isPaused ? 1 : [1, 1.2, 1],
                      opacity: isPaused ? 0.5 : 1
                    }}
                    transition={{ 
                      repeat: isPaused ? 0 : Infinity, 
                      duration: 1 
                    }}
                    className="w-2 h-2 rounded-full bg-destructive"
                  />
                  <span className="text-sm text-muted-foreground">
                    {isPaused ? "متوقف مؤقتاً" : "جاري التسجيل..."}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  variant="hero"
                  size="lg"
                  className="gap-2 rounded-full px-8"
                >
                  <Mic className="w-5 h-5" />
                  ابدأ التسجيل
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="glass"
                    size="icon"
                    className="w-12 h-12 rounded-full"
                  >
                    {isPaused ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Pause className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="icon"
                    className="w-14 h-14 rounded-full"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-6 border-primary/20"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium text-foreground">تسجيل جاهز</p>
              <p className="text-sm text-muted-foreground">المدة: {formatTime(recordingTime)}</p>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <audio 
                controls 
                src={audioUrl} 
                className="w-full mb-4 rounded-lg"
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={discardRecording}
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </Button>
              <Button
                onClick={saveRecording}
                variant="hero"
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ التسجيل
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceRecorder;
