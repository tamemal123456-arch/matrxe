import { useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Play, X, Check, Sparkles, Mic, MessageSquare, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { ThreeScene } from "./ThreeScene";

function TwinAvatar3D() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
      const bob = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = bob;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.5;
      ringRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[1.4, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.2}
          distort={0.3}
          speed={2}
          roughness={0.15}
          metalness={0.9}
        />
      </Sphere>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.02, 32, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.4, 0.01, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Float key={i} speed={1.5 + i * 0.5} floatIntensity={0.8}>
          <mesh position={[
            Math.cos(i * Math.PI / 2) * 2.6,
            Math.sin(i * Math.PI / 2) * 2.6 * 0.7,
            0,
          ]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} />
          </mesh>
        </Float>
      ))}
      {[0, 1, 2].map((i) => (
        <Float key={`particle-${i}`} speed={2} floatIntensity={1}>
          <mesh position={[
            Math.cos(Date.now() * 0.001 + i * 2.1) * 1.8,
            Math.sin(Date.now() * 0.001 + i * 2.1) * 0.5,
            Math.sin(Date.now() * 0.001 + i * 2.1) * 1.8,
          ]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

const HeroSection = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <ThreeScene />
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background pointer-events-none"
      />
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right order-2 lg:order-1"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card backdrop-blur-md border-primary/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="tech-tag text-muted-foreground">AI · DIGITAL TWIN PLATFORM</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">— الأولى عربياً</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-cairo text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] mb-6 tracking-wide"
            >
              <span className="text-foreground/90">أنشئ</span>{" "}
              <span className="gradient-text digital-glitch font-tech" data-text="توأمك الرقمي">
                توأمك الرقمي
              </span>
              <br />
              <span className="text-foreground/80 digital-cursor font-mono-tech text-xl sm:text-2xl lg:text-3xl xl:text-4xl mt-2 block tracking-widest">
                بقوة الذكاء الاصطناعي
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mr-0 leading-relaxed backdrop-blur-sm rounded-2xl p-4 glass-card/50 border-border/20"
              style={{ fontFamily: "'Readex Pro', 'Cairo', sans-serif" }}
            >
              منصة <span className="font-tech text-primary">MATRXe</span> تتيح لك إنشاء نسخة رقمية ذكية تحاكي صوتك وملامحك، تتحدث وتقدم المساعدة والاستشارات نيابةً عنك
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end"
            >
              <Link to="/auth">
                <Button variant="hero" size="xl" className="relative overflow-hidden group">
                  <span className="relative z-10">ابدأ مجاناً</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl" onClick={() => setShowDemo(true)}>
                <Play className="w-5 h-5 ml-2" />
                شاهد كيف يعمل
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/30"
            >
              {[
                { value: "10K+", label: "مستخدم نشط" },
                { value: "50M+", label: "محادثة ذكية" },
                { value: "99.9%", label: "وقت التشغيل" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-right">
                  <div className="font-tech text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-secondary/10 to-transparent blur-3xl" />
            <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={0.6} />
              <Suspense fallback={null}>
                <TwinAvatar3D />
              </Suspense>
            </Canvas>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="tech-tag text-accent backdrop-blur-sm bg-background/30 px-3 py-1 rounded-full text-xs">// DIGITAL TWIN PLATFORM</span>
                <span
                  className="font-display-ar inline-block px-6 py-2 rounded-full border border-primary/30 bg-background/40 backdrop-blur-md text-primary text-xl sm:text-2xl tracking-wider scan-sweep"
                  style={{ textShadow: "0 0 14px hsl(var(--primary) / 0.6)" }}
                >
                  منصة التوأم الرقمي
                </span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-4 top-1/4 glass-card px-4 py-3 rounded-xl backdrop-blur-md bg-background/60"
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-accent" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">استنساخ الصوت</div>
                  <div className="text-xs text-muted-foreground">دقة 98%</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -left-4 top-2/3 glass-card px-4 py-3 rounded-xl backdrop-blur-md bg-background/60"
              animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">ذكاء اصطناعي</div>
                  <div className="text-xs text-muted-foreground">محادثات ذكية</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">اسحب للأسفل</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2 backdrop-blur-sm bg-background/20">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl glass-card rounded-3xl p-8 overflow-hidden border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 left-4 p-2 rounded-full glass-card hover:bg-destructive/10 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8" dir="rtl">
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4">
                  كيف يعمل ماتركس.إ؟
                </h2>
                <p className="text-muted-foreground">
                  أنشئ توأمك الرقمي في 4 خطوات بسيطة
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6" dir="rtl">
                {[
                  { num: 1, icon: null, title: "سجّل معلوماتك", desc: "أدخل اسم توأمك الرقمي ووصفه واختر شخصيته المميزة", from: "from-primary", to: "to-accent" },
                  { num: 2, icon: Mic, title: "استنسخ صوتك", desc: "سجّل عينات صوتية وسنستنسخ صوتك بدقة عالية ليتحدث توأمك بصوتك", from: "from-accent", to: "to-primary" },
                  { num: 3, icon: MessageSquare, title: "تحدث مع توأمك", desc: "ابدأ محادثات ذكية مع توأمك الرقمي الذي يفهم شخصيتك ويتحدث بأسلوبك", from: "from-primary", to: "to-secondary" },
                  { num: 4, icon: Volume2, title: "استمع لصوتك", desc: "توأمك يرد عليك بصوتك المستنسخ مع تأثيرات بصرية مذهلة", from: "from-secondary", to: "to-accent" },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (i + 1) }}
                    className="glass-card rounded-2xl p-6 border-border/30 backdrop-blur-sm bg-background/40"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.from} ${step.to} flex items-center justify-center text-white font-bold shrink-0`}>
                        {step.icon ? <step.icon className={`w-5 h-5 ${step.icon === Mic ? "text-accent" : step.icon === MessageSquare ? "text-primary" : "text-secondary"}`} /> : step.num}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
                dir="rtl"
              >
                {[
                  { icon: Check, text: "استنساخ صوت بدقة 98%" },
                  { icon: Sparkles, text: "ذكاء اصطناعي متقدم" },
                  { icon: MessageSquare, text: "محادثات غير محدودة" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm backdrop-blur-sm bg-background/40">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <Link to="/auth" onClick={() => setShowDemo(false)}>
                  <Button variant="hero" size="xl">
                    <Sparkles className="w-5 h-5 ml-2" />
                    أنشئ توأمك الآن
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
