// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioAnalyzerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  barsCount?: number;
}

interface UseAudioAnalyzerReturn {
  audioLevels: number[];
  averageLevel: number;
  peakLevel: number;
  isAnalyzing: boolean;
  connectAudioElement: (audio: HTMLAudioElement) => void;
  disconnectAudio: () => void;
}

export const useAudioAnalyzer = (
  options: UseAudioAnalyzerOptions = {}
): UseAudioAnalyzerReturn => {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    barsCount = 12,
  } = options;

  const [audioLevels, setAudioLevels] = useState<number[]>(
    Array(barsCount).fill(0)
  );
  const [averageLevel, setAverageLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !isAnalyzing) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Calculate levels for visualization bars
    const levels: number[] = [];
    const step = Math.floor(bufferLength / barsCount);

    for (let i = 0; i < barsCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      const avg = sum / step / 255;
      levels.push(Math.max(0.05, avg));
    }

    // Calculate average and peak levels
    let total = 0;
    let peak = 0;
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      total += value;
      if (value > peak) peak = value;
    }
    const average = total / bufferLength;

    setAudioLevels(levels);
    setAverageLevel(average);
    setPeakLevel(peak);

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, [barsCount, isAnalyzing]);

  const connectAudioElement = useCallback(
    (audio: HTMLAudioElement) => {
      // Disconnect previous audio if exists
      if (connectedAudioRef.current === audio && isAnalyzing) {
        return;
      }

      try {
        // Create or resume AudioContext
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current;

        // Resume context if suspended
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }

        // Create analyser if not exists
        if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = fftSize;
          analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
          analyserRef.current.connect(audioContext.destination);
        }

        // Disconnect previous source
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch {
            // Ignore disconnect errors
          }
        }

        // Create new source and connect
        sourceRef.current = audioContext.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);

        connectedAudioRef.current = audio;
        setIsAnalyzing(true);

        // Start animation loop
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(analyze);
      } catch (error) {
        console.error("Error connecting audio element:", error);
      }
    },
    [fftSize, smoothingTimeConstant, analyze, isAnalyzing]
  );

  const disconnectAudio = useCallback(() => {
    setIsAnalyzing(false);
    setAudioLevels(Array(barsCount).fill(0));
    setAverageLevel(0);
    setPeakLevel(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [barsCount]);

  // Start analysis when isAnalyzing becomes true
  useEffect(() => {
    if (isAnalyzing && analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyze);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, analyze]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          // Ignore
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioLevels,
    averageLevel,
    peakLevel,
    isAnalyzing,
    connectAudioElement,
    disconnectAudio,
  };
};
