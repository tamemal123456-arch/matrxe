// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { 
  Send, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Trash2,
  Clock,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import SpeakingAvatar from "@/components/SpeakingAvatar";
import TalkingVideo from "@/components/TalkingVideo";
import DeepSearchButton from "@/components/DeepSearchButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ToolResult {
  tool: string;
  result: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  tool_results?: ToolResult[];
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

interface Twin {
  id: string;
  name: string;
  personality: string | null;
  avatar_url: string | null;
  voice_id: string | null;
}

// 3D Avatar Component
function Avatar({ isSpeaking, color }: { isSpeaking: boolean; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      if (isSpeaking) {
        meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
      } else {
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1, 0.1);
      }
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={isSpeaking ? 0.4 : 0.2}
          speed={isSpeaking ? 4 : 2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((Date.now() * 0.001 + i * 2.1)) * 1.8,
            Math.sin((Date.now() * 0.001 + i * 2.1)) * 0.3,
            Math.sin((Date.now() * 0.001 + i * 2.1)) * 1.8,
          ]}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      ))}
    </group>
  );
}

const TwinChat = () => {
  const { twinId } = useParams<{ twinId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [twin, setTwin] = useState<Twin | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [loadingTwin, setLoadingTwin] = useState(true);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio analyzer for lip sync
  const {
    audioLevels: playbackAudioLevels,
    averageLevel,
    connectAudioElement,
    disconnectAudio,
  } = useAudioAnalyzer({ barsCount: 12 });
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const recordingAnalyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingAudioLevels, setRecordingAudioLevels] = useState<number[]>(Array(12).fill(0.1));
  const animationFrameRef = useRef<number>();
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch twin data
  useEffect(() => {
    const fetchTwin = async () => {
      if (!twinId || !user) return;

      const { data, error } = await supabase
        .from("digital_twins")
        .select("*")
        .eq("id", twinId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على التوأم الرقمي",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setTwin(data);
      setLoadingTwin(false);
    };

    if (user) {
      fetchTwin();
    }
  }, [twinId, user, navigate, toast]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!twinId || !user) return;

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("twin_id", twinId)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [twinId, user]);

  // Fetch messages for current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", currentConversation)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        })));
      }
    };

    fetchMessages();
  }, [currentConversation]);

  const createNewConversation = async () => {
    if (!twinId || !user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        twin_id: twinId,
        user_id: user.id,
        title: "محادثة جديدة",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء محادثة جديدة",
        variant: "destructive",
      });
      return null;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data.id);
    setMessages([]);
    return data.id;
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المحادثة",
        variant: "destructive",
      });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
    setDeleteConversationId(null);
    toast({
      title: "تم الحذف",
      description: "تم حذف المحادثة بنجاح",
    });
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });

    // Update conversation title with first user message
    if (role === "user") {
      const { data: conv } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", conversationId)
        .single();
      if (conv?.title === "محادثة جديدة") {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        await supabase
          .from("conversations")
          .update({ title })
          .eq("id", conversationId);
        
        setConversations(prev => 
          prev.map(c => c.id === conversationId ? { ...c, title } : c)
        );
      }
    }
  };

  // Text-to-Speech function - uses ElevenLabs for natural voice, falls back to browser
  const playTextToSpeech = async (text: string) => {
    if (!ttsEnabled) return;
    
    try {
      setIsPlayingAudio(true);
      setIsSpeaking(true);
      
      // Try ElevenLabs TTS via edge function first
      try {
        const token = await getAccessToken();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text,
              voiceId: twin?.voice_id || undefined,
            }),
          }
        );

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
          }

          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          // Connect audio analyzer for lip sync
          connectAudioElement(audio);
          
          audio.onended = () => {
            setIsPlayingAudio(false);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            disconnectAudio();
          };
          
          audio.onerror = () => {
            setIsPlayingAudio(false);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            fallbackTTS(text);
          };
          
          audio.play().catch(() => fallbackTTS(text));
          return;
        }
      } catch {
        // Fallback to browser TTS
      }
      
      // Fallback: browser speech synthesis
      fallbackTTS(text);
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingAudio(false);
      setIsSpeaking(false);
      toast({
        title: "خطأ في تشغيل الصوت",
        description: "لم يتم تشغيل الصوت، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const fallbackTTS = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isArabic = /[\u0600-\u06FF]/.test(text);
      utterance.lang = isArabic ? "ar-SA" : "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      disconnectAudio();
    }
    setIsPlayingAudio(false);
    setIsSpeaking(false);
  };

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  };

  const streamChat = useCallback(
    async (userMessage: string, conversationId: string, currentHistory?: Message[]) => {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-chat`;

      const token = await getAccessToken();
      const historyMessages = currentHistory || messages;
      const history = historyMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          twinName: twin?.name || "التوأم الرقمي",
          twinPersonality: twin?.personality || "ذكي، مبدع، فصيح",
          history,
          twinId: twinId,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "فشل الاتصال");
      }

      const data = await response.json();
      const assistantContent: string = data.content || "";
      const toolResults: ToolResult[] = data.tool_results || [];

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: assistantContent, tool_results: toolResults },
      ]);

      if (assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
        await playTextToSpeech(assistantContent);
      }

      return assistantContent;
    },
    [twin, ttsEnabled, messages]
  );

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    let conversationId = currentConversation;
    
    // Create new conversation if none selected
    if (!conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    // Save user message to database
    await saveMessage(conversationId, "user", userMessage.content);

    try {
      await streamChat(userMessage.content, conversationId, updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
        },
      ]);
      await saveMessage(conversationId, "assistant", errorMessage);
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording functions
  const updateRecordingAudioLevels = useCallback(() => {
    if (recordingAnalyserRef.current && isRecording) {
      const dataArray = new Uint8Array(recordingAnalyserRef.current.frequencyBinCount);
      recordingAnalyserRef.current.getByteFrequencyData(dataArray);
      
      const levels = [];
      const step = Math.floor(dataArray.length / 12);
      for (let i = 0; i < 12; i++) {
        const value = dataArray[i * step] / 255;
        levels.push(Math.max(0.1, value));
      }
      setRecordingAudioLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateRecordingAudioLevels);
    }
  }, [isRecording]);

  const processVoiceToText = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      // Try browser built-in Speech Recognition first (no deployment needed)
      if (audioBlob && "SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "ar-SA";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const text = await new Promise<string>((resolve, reject) => {
          recognition.onresult = (event: any) => resolve(event.results[0][0].transcript);
          recognition.onerror = () => reject(new Error("Browser speech failed"));
          recognition.start();
          setTimeout(() => { recognition.stop(); reject(new Error("timeout")); }, 10000);
        });

        if (text) {
          setInputValue(text);
          setTimeout(() => handleSendVoiceMessage(text), 100);
          setIsProcessingVoice(false);
          return;
        }
      }

      // Fallback: try edge function
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const token = await getAccessToken();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ audio: base64, mime_type: audioBlob.type }),
        }
      );

      if (!response.ok) throw new Error("Failed to process audio");

      const data = await response.json();
      if (data.text) {
        setInputValue(data.text);
        setTimeout(() => handleSendVoiceMessage(data.text), 100);
      }
    } catch (error) {
      console.error("Audio processing error:", error);
      toast({
        title: "خطأ في المعالجة",
        description: "لم نتمكن من معالجة الصوت. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleSendVoiceMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let conversationId = currentConversation;
    
    if (!conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    await saveMessage(conversationId, "user", userMessage.content);

    try {
      await streamChat(userMessage.content, conversationId, updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
        },
      ]);
      await saveMessage(conversationId, "assistant", errorMessage);
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      recordingAudioContextRef.current = new AudioContext();
      recordingAnalyserRef.current = recordingAudioContextRef.current.createAnalyser();
      recordingAnalyserRef.current.fftSize = 256;
      
      const source = recordingAudioContextRef.current.createMediaStreamSource(stream);
      source.connect(recordingAnalyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processVoiceToText(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      animationFrameRef.current = requestAnimationFrame(updateRecordingAudioLevels);
      
      toast({
        title: "جاري التسجيل...",
        description: "تحدث الآن ثم اضغط للإيقاف",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "خطأ في الميكروفون",
        description: "لم نتمكن من الوصول للميكروفون. يرجى التحقق من الأذونات.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (recordingAudioContextRef.current) {
        recordingAudioContextRef.current.close();
      }
      
      setRecordingAudioLevels(Array(12).fill(0.1));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingAudioContextRef.current) {
        recordingAudioContextRef.current.close();
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loadingTwin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-l border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة للوحة التحكم
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            {twin?.avatar_url ? (
              <img 
                src={twin.avatar_url} 
                alt={twin.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-foreground">{twin?.name}</h2>
              <p className="text-xs text-muted-foreground">{twin?.personality}</p>
            </div>
          </div>

          <Button 
            onClick={createNewConversation} 
            className="w-full gap-2"
            variant="hero"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                لا توجد محادثات بعد
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversation === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setCurrentConversation(conv.id)}
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.title || "محادثة بدون عنوان"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(conv.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConversationId(conv.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* 3D Avatar Header with Talking Image */}
        <div className="relative h-56 bg-gradient-to-b from-background to-card border-b border-border overflow-hidden">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={0.5} />
            <Suspense fallback={null}>
              <Avatar isSpeaking={isSpeaking || isPlayingAudio} color="#00d4ff" />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>

          {/* Talking Avatar Image - with real-time audio sync */}
          {twin?.avatar_url && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <SpeakingAvatar
                avatarUrl={twin.avatar_url}
                isPlaying={isPlayingAudio}
                audioLevels={playbackAudioLevels}
                averageLevel={averageLevel}
                size="lg"
              />
            </div>
          )}

          {/* TTS Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 h-10 w-10 rounded-full glass-card"
            onClick={() => {
              if (isPlayingAudio) {
                stopAudio();
              } else {
                setTtsEnabled(!ttsEnabled);
              }
            }}
          >
            {ttsEnabled ? (
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? "text-accent animate-pulse" : "text-primary"}`} />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium gradient-text">
                {twin?.name || "التوأم الرقمي"}
              </span>
              {isPlayingAudio && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="flex items-center gap-1"
                >
                  <div className="w-1 h-3 bg-accent rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {!currentConversation && messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    ابدأ محادثة جديدة
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    اختر محادثة من القائمة أو أنشئ محادثة جديدة للبدء
                  </p>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <Sparkles className="w-16 h-16 text-primary/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    ابدأ المحادثة مع {twin?.name}
                  </p>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-muted text-foreground rounded-tr-sm"
                          : "bg-gradient-to-r from-primary to-accent text-white rounded-tl-sm"
                      }`}
                    >
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-pre:bg-black/30 prose-pre:text-xs">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.tool_results && msg.tool_results.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.tool_results.map((tr, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-white/20 bg-black/20">
                              <div className="px-3 py-1 text-xs font-medium opacity-80 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> {tr.tool}
                              </div>
                              {tr.tool === "generate_image" && tr.result?.image_url && (
                                <img src={tr.result.image_url} alt={tr.result.prompt || "generated"} className="w-full max-w-md" />
                              )}
                              {tr.tool === "web_search" && tr.result?.results && (
                                <div className="px-3 py-2 text-xs whitespace-pre-wrap opacity-90 max-h-48 overflow-y-auto">{tr.result.results}</div>
                              )}
                              {["analyze_data","write_content","generate_code","translate","plan_task","fetch_url"].includes(tr.tool) && (
                                <div className="px-3 py-2 text-xs opacity-90 max-h-64 overflow-y-auto prose prose-xs dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {tr.result?.analysis || tr.result?.content || tr.result?.code || tr.result?.translation || tr.result?.plan || tr.result?.results || (tr.result?.url ? `**${tr.result.url}**\n\n${tr.result.content || ""}` : "") || tr.result?.error || ""}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.created_at && (
                        <p className={`text-xs mt-1 ${
                          msg.role === "user" ? "text-muted-foreground" : "text-white/70"
                        }`}>
                          {formatDate(msg.created_at)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Self Diagnosis - moved to twin dashboard */}
        {twin && (
          <div className="px-6 pt-2 max-w-3xl mx-auto w-full">
            <Link to="/dashboard" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>التشخيص الذاتي والصيانة متاح الآن في لوحة تحكم التوأم الرقمي</span>
              <ArrowRight className="w-4 h-4 mr-auto" />
            </Link>
          </div>
        )}

        {/* Talking Video Generator - for last assistant message */}
        {twin?.avatar_url && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <div className="px-6 pt-2 max-w-3xl mx-auto w-full">
            <TalkingVideo
              avatarUrl={twin.avatar_url}
              twinName={twin.name}
              voiceId={twin.voice_id || undefined}
              text={messages[messages.length - 1].content}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50">
          {/* File Preview */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-3xl mx-auto mb-3"
              >
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex gap-2 flex-1 overflow-x-auto">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="relative shrink-0">
                        {file.type.startsWith("image/") ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                            <File className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] text-muted-foreground truncate w-16 text-center mt-1">{file.name.substring(0, 10)}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Recording Visualizer */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-3xl mx-auto mb-3"
              >
                <div className="flex items-center justify-center gap-1 h-10 px-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mr-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 rounded-full bg-destructive"
                    />
                    <span className="text-sm text-destructive font-medium">جاري التسجيل...</span>
                  </div>
                  {recordingAudioLevels.map((level, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-destructive to-accent rounded-full"
                      animate={{ height: `${level * 30}px` }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-3xl mx-auto flex items-center gap-2">
            {/* File Upload Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isRecording}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
                  toast({ title: "تم", description: `تم إضافة ${files.length} ملف` });
                }
                e.target.value = "";
              }}
            />

            {/* Deep Search Button */}
            <DeepSearchButton
              onClick={() => {
                setInputValue(prev => prev + " [بحث عميق] ");
              }}
              disabled={isLoading || isRecording}
            />

            {/* Microphone Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                className={`h-12 w-12 p-0 rounded-full ${
                  isRecording ? "animate-pulse" : ""
                }`}
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isLoading || isProcessingVoice}
              >
                {isProcessingVoice ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </motion.div>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك أو اضغط على الميكروفون للتحدث..."
              disabled={isLoading || isRecording}
              className="flex-1 h-12 glass-card border-border/50 bg-background/50 text-base"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim() || isRecording}
              variant="hero"
              size="lg"
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={() => setDeleteConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المحادثة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المحادثة؟ سيتم حذف جميع الرسائل ولا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConversationId && deleteConversation(deleteConversationId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TwinChat;
