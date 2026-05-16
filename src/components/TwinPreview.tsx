// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Send, MessageSquare, Volume2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as THREE from "three";

interface TwinPreviewProps {
  twinName: string;
  personality: string;
  avatarImage?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// 3D Avatar Component
function Avatar({ isSpeaking, color }: { isSpeaking: boolean; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hue, setHue] = useState(0);

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
    setHue((state.clock.elapsedTime * 10) % 360);
  });

  return (
    <group>
      {/* Main Avatar Sphere */}
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

      {/* Glow Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>

      {/* Orbiting Particles */}
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

const TwinPreview = ({ twinName, personality, avatarImage }: TwinPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = useCallback(
    async (userMessage: string) => {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-chat`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage,
          twinName: twinName || "التوأم الرقمي",
          twinPersonality: personality || "ودود ومرح",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("فشل الاتصال");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      setIsSpeaking(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  { id: crypto.randomUUID(), role: "assistant", content: assistantContent },
                ];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsSpeaking(false);
    },
    [twinName, personality]
  );

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      await streamChat(userMessage.content);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
        },
      ]);
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

  return (
    <div className="glass-card rounded-2xl overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      {/* 3D Avatar Section */}
      <div className="relative h-64 bg-gradient-to-b from-background to-background/50">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={0.5} />
          <Suspense fallback={null}>
            <Avatar isSpeaking={isSpeaking} color="#00d4ff" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>

        {/* Avatar Image Overlay */}
        {avatarImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
              <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Twin Name Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-card"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium gradient-text">
              {twinName || "التوأم الرقمي"}
            </span>
            {isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Volume2 className="w-4 h-4 text-accent" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">تحدث مع توأمك الرقمي</span>
        </div>

        {/* Messages */}
        <div className="h-48 overflow-y-auto space-y-3 mb-4 scrollbar-thin">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full"
              >
                <p className="text-sm text-muted-foreground text-center">
                  ابدأ المحادثة لتجربة توأمك الرقمي
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
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-muted text-foreground rounded-tr-sm"
                        : "bg-gradient-to-r from-primary to-accent text-white rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            disabled={isLoading}
            className="flex-1 glass-card border-border/50 bg-background/50"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            variant="hero"
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TwinPreview;
