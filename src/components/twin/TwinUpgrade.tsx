import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, Star, Zap, Shield, Award, Check, Sparkles,
  Rocket, Infinity, Lock, Unlock, Bot, MessageSquare,
  Mic, Video, Database, Users, Globe, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface TwinUpgradeProps {
  twinId: string;
  twinName: string;
}

const PLANS = [
  {
    id: "free",
    name: "مجاني",
    price: "0",
    period: "شهرياً",
    icon: Bot,
    color: "from-gray-500/20 to-slate-500/20",
    textColor: "text-gray-500",
    featured: false,
    features: [
      { icon: MessageSquare, text: "100 محادثة شهرياً", included: true },
      { icon: Mic, text: "صوت أساسي", included: true },
      { icon: Database, text: "10MB ذاكرة", included: true },
      { icon: Bot, text: "توأم رقمي واحد", included: true },
      { icon: Star, text: "شخصية أساسية", included: true },
      { icon: Globe, text: "ربط ويب", included: true },
      { icon: Video, text: "فيديو ناطق", included: false },
      { icon: Users, text: "تكامل توائم", included: false },
      { icon: BarChart3, text: "تحليلات متقدمة", included: false },
      { icon: Shield, text: "API Token", included: false },
      { icon: Infinity, text: "محادثات غير محدودة", included: false },
      { icon: Zap, text: "AI مخصص", included: false },
    ],
  },
  {
    id: "pro",
    name: "احترافي",
    price: "29",
    period: "شهرياً",
    icon: Crown,
    color: "from-amber-500/20 to-yellow-500/20",
    textColor: "text-amber-500",
    featured: true,
    badge: "الأكثر شيوعاً",
    features: [
      { icon: MessageSquare, text: "10,000 محادثة شهرياً", included: true },
      { icon: Mic, text: "صوت متقدم (11 مستنسخ)", included: true },
      { icon: Database, text: "1GB ذاكرة", included: true },
      { icon: Bot, text: "حتى 3 توائم", included: true },
      { icon: Star, text: "شخصية مخصصة بالكامل", included: true },
      { icon: Globe, text: "ربط ويب + واتساب", included: true },
      { icon: Video, text: "فيديو ناطق", included: true },
      { icon: Users, text: "تكامل توائم", included: true },
      { icon: BarChart3, text: "تحليلات متقدمة", included: true },
      { icon: Shield, text: "API Token (محدود)", included: true },
      { icon: Infinity, text: "محادثات غير محدودة", included: false },
      { icon: Zap, text: "AI مخصص", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "مؤسسات",
    price: "99",
    period: "شهرياً",
    icon: Rocket,
    color: "from-purple-500/20 to-violet-500/20",
    textColor: "text-purple-500",
    featured: false,
    badge: "الأقوى",
    features: [
      { icon: MessageSquare, text: "محادثات غير محدودة", included: true },
      { icon: Mic, text: "صوت غير محدود + استنساخ", included: true },
      { icon: Database, text: "100GB ذاكرة", included: true },
      { icon: Bot, text: "توائم غير محدودة", included: true },
      { icon: Star, text: "شخصية + أسلوب مخصص", included: true },
      { icon: Globe, text: "جميع طرق الربط", included: true },
      { icon: Video, text: "فيديو ناطق HD", included: true },
      { icon: Users, text: "شبكة توائم كاملة", included: true },
      { icon: BarChart3, text: "تحليلات + تقارير", included: true },
      { icon: Shield, text: "API Token غير محدود", included: true },
      { icon: Infinity, text: "محادثات غير محدودة", included: true },
      { icon: Zap, text: "AI مخصص + خادم خاص", included: true },
    ],
  },
];

const TwinUpgrade = ({ twinId, twinName }: TwinUpgradeProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState("free");

  const handleUpgrade = (planId: string) => {
    if (planId === "free") {
      toast({ title: "البقاء على الخطة المجانية", description: "يمكنك الترقية في أي وقت" });
      return;
    }
    navigate("/dashboard?tab=billing");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-2">ترقية {twinName}</h2>
        <p className="text-muted-foreground">اختر الخطة المناسبة لتفعيل جميع إمكانيات توأمك الرقمي</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {PLANS.map((plan, idx) => {
          const PlanIcon = plan.icon;
          const isSelected = selected === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : plan.featured
                  ? "border-amber-500/30 hover:border-amber-500/60"
                  : "border-border hover:border-primary/30"
              } ${plan.featured ? "scale-105" : ""}`}
              onClick={() => setSelected(plan.id)}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1">
                    <Sparkles className="w-3 h-3 ml-1" /> {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                  <PlanIcon className={`w-8 h-8 ${plan.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground"> {plan.period}</span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feat, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm p-1.5 rounded-lg ${
                    feat.included ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {feat.included ? (
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <span>{feat.text}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.featured ? "hero" : isSelected ? "default" : "outline"}
                className="w-full mt-6"
                size="lg"
                onClick={() => handleUpgrade(plan.id)}
              >
                {plan.id === "free" ? "خطتك الحالية" : `اشترك ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <Card className="glass-card rounded-2xl p-6 text-center">
        <h3 className="font-bold text-foreground mb-2">مقارنة المميزات</h3>
        <p className="text-sm text-muted-foreground mb-4">
          جميع الخطط تشمل التشفير الكامل والدعم الفني. للمؤسسات الكبيرة، <a href="/contact" className="text-primary hover:underline">تواصل معنا</a> لحلول مخصصة.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-500" /> تشفير AES-256</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-primary" /> دعم فني 24/7</span>
          <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" /> ضمان استرداد 30 يوماً</span>
        </div>
      </Card>
    </div>
  );
};

export default TwinUpgrade;