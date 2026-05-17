import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, MessageSquare, Settings, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Sparkles, title: "مرحباً بك في ماترِكسي!", desc: "منصة الذكاء الاصطناعي لإنشاء التوائم الرقمية الذكية التي تحاكي شخصيتك.", color: "from-primary to-accent" },
  { icon: Bot, title: "أنشئ توأمك الرقمي", desc: "حدد الشخصية، الصوت، والمظهر. توأمك يتعلم منك ويصبح نسخة رقمية منك.", color: "from-accent to-secondary" },
  { icon: MessageSquare, title: "ابدأ المحادثة", desc: "تحدث مع توأمك كتابةً وصوتاً. التوأم يتذكر المحادثات السابقة ويتطور مع الوقت.", color: "from-secondary to-primary" },
  { icon: Settings, title: "استكشف الميزات", desc: "فيديو ناطق، لغة إشارة، أدوات AI، تشخيص ذاتي، ومهام Offline.", color: "from-primary to-accent" },
];

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    localStorage.setItem("matrxe_onboarding_complete", "true");
    onClose();
  };

  if (!open) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl border border-border/50 w-full max-w-md mx-4 overflow-hidden"
      >
        <div className={`h-2 bg-gradient-to-r ${current.color}`} />

        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center`}>
            <current.icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{current.title}</h2>
          <p className="text-muted-foreground">{current.desc}</p>
        </div>

        <div className="flex items-center justify-between px-8 pb-8">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                <ChevronRight className="w-4 h-4 ml-1" /> السابق
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)} className="bg-gradient-to-r from-primary to-accent">
                التالي <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleComplete} className="bg-gradient-to-r from-primary to-accent">
                <Check className="w-4 h-4 ml-1" /> ابدأ الآن
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
