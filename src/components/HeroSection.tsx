// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, X, Check, Sparkles, Mic, MessageSquare, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroMatrxeImage from "@/assets/hero-matrxe.png";

const HeroSection = () => {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
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
              <span
                className="gradient-text digital-glitch font-tech"
                data-text="توأمك الرقمي"
              >
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
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mr-0 leading-relaxed"
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
                <Button variant="hero" size="xl">
                  ابدأ مجاناً
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl" onClick={() => setShowDemo(true)}>
                <Play className="w-5 h-5 ml-2" />
                شاهد كيف يعمل
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50"
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

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-transparent blur-3xl" />
              
              {/* Main Image */}
              <motion.img
                src={heroMatrxeImage}
                alt="ماتركس.إ Digital Twin Intelligence"
                className="relative w-full max-w-lg mx-auto"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Digital Twin Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="relative mt-6 flex flex-col items-center gap-2"
              >
                <span className="tech-tag text-accent">// DIGITAL TWIN PLATFORM</span>
                <span
                  className="font-display-ar inline-block px-6 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md text-primary text-xl sm:text-2xl tracking-wider scan-sweep"
                  style={{ textShadow: "0 0 14px hsl(var(--primary) / 0.6)" }}
                >
                  منصة التوأم الرقمي
                </span>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -right-4 top-1/4 glass-card px-4 py-3 rounded-xl"
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent">🎙️</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">استنساخ الصوت</div>
                    <div className="text-xs text-muted-foreground">دقة 98%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-4 top-2/3 glass-card px-4 py-3 rounded-xl"
                animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary">🤖</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">ذكاء اصطناعي</div>
                    <div className="text-xs text-muted-foreground">محادثات ذكية</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </motion.div>

      {/* Demo Modal */}
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
              className="relative w-full max-w-4xl glass-card rounded-3xl p-8 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 left-4 p-2 rounded-full glass-card hover:bg-destructive/10 transition-colors"
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
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 border-primary/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">سجّل معلوماتك</h3>
                      <p className="text-sm text-muted-foreground">
                        أدخل اسم توأمك الرقمي ووصفه واختر شخصيته المميزة
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 border-accent/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-accent" />
                        استنسخ صوتك
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        سجّل عينات صوتية وسنستنسخ صوتك بدقة عالية ليتحدث توأمك بصوتك
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 border-primary/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        تحدث مع توأمك
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ابدأ محادثات ذكية مع توأمك الرقمي الذي يفهم شخصيتك ويتحدث بأسلوبك
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-2xl p-6 border-accent/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-secondary" />
                        استمع لصوتك
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        توأمك يرد عليك بصوتك المستنسخ مع تأثيرات بصرية مذهلة
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Features */}
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
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <Link to="/auth">
                  <Button variant="hero" size="xl" onClick={() => setShowDemo(false)}>
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
