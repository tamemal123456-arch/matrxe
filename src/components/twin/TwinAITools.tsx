import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Globe, Search, Image, Pen, Music, Video,
  BarChart3, MessageCircle, Brain, Code, Database,
  Shield, ToggleLeft, ToggleRight, Settings, Info,
  ExternalLink, Zap, Star, Wifi, WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface TwinAIToolsProps {
  twinId: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  provider: string;
  enabled: boolean;
  background: boolean;
  color: string;
  config?: Record<string, string>;
}

const AVAILABLE_TOOLS: Tool[] = [
  { id: "web_search", name: "بحث في الإنترنت", description: "بحث متقدم في جوجل وبينغ"، icon: Globe, category: "search", provider: "Google/Bing", enabled: true, background: true, color: "from-blue-500/20 to-indigo-500/20" },
  { id: "deep_search", name: "بحث عميق", description: "تحليل متعمق للموضوعات المعقدة", icon: Search, category: "search", provider: "AI Deep Search", enabled: true, background: false, color: "from-purple-500/20 to-violet-500/20" },
  { id: "image_gen", name: "توليد الصور", description: "إنشاء صور من النصوص", icon: Image, category: "creative", provider: "DALL-E / Stable Diffusion", enabled: false, background: false, color: "from-pink-500/20 to-rose-500/20" },
  { id: "content_write", name: "كتابة المحتوى", description: "كتابة مقالات وإعلانات", icon: Pen, category: "creative", provider: "GPT-4o", enabled: true, background: true, color: "from-amber-500/20 to-yellow-500/20" },
  { id: "tts", name: "نص إلى صوت", description: "تحويل النص إلى كلام طبيعي", icon: Music, category: "media", provider: "ElevenLabs", enabled: true, background: false, color: "from-green-500/20 to-emerald-500/20" },
  { id: "video_gen", name: "فيديو ناطق", description: "توليد فيديو متحرك ناطق", icon: Video, category: "media", provider: "D-ID / HeyGen", enabled: false, background: false, color: "from-red-500/20 to-orange-500/20" },
  { id: "data_analyze", name: "تحليل البيانات", description: "تحليل الأرقام والإحصائيات", icon: BarChart3, category: "analytics", provider: "AI Analytics", enabled: true, background: true, color: "from-cyan-500/20 to-teal-500/20" },
  { id: "sentiment", name: "تحليل المشاعر", description: "فهم المشاعر من النصوص", icon: MessageCircle, category: "analytics", provider: "AI Sentiment", enabled: true, background: true, color: "from-orange-500/20 to-amber-500/20" },
  { id: "code_gen", name: "توليد أكواد", description: "كتابة وتصحيح الأكواد", icon: Code, category: "technical", provider: "GPT-4o / Claude", enabled: true, background: false, color: "from-gray-500/20 to-slate-500/20" },
  { id: "knowledge_graph", name: "شجرة المعرفة", description: "ربط المعلومات بقاعدة معرفة", icon: Database, category: "learning", provider: "Knowledge AI", enabled: true, background: true, color: "from-teal-500/20 to-green-500/20" },
  { id: "self_learn", name: "تعلم ذاتي", description: "البحث وتعلم مواضيع جديدة", icon: Brain, category: "learning", provider: "Self-Learning AI", enabled: true, background: true, color: "from-indigo-500/20 to-purple-500/20" },
  { id: "translation", name: "ترجمة فورية", description: "ترجمة بين 100+ لغة", icon: Globe, category: "language", provider: "AI Translate", enabled: true, background: true, color: "from-sky-500/20 to-blue-500/20" },
  { id: "security_scan", name: "فحص أمني", description: "فحص الثغرات الأمنية", icon: Shield, category: "system", provider: "Security AI", enabled: true, background: true, color: "from-red-500/20 to-rose-500/20" },
  { id: "memory_opt", name: "تحسين الذاكرة", description: "إدارة وتحسين الذاكرة الطويلة", icon: Database, category: "system", provider: "Memory AI", enabled: true, background: true, color: "from-blue-500/20 to-indigo-500/20" },
];

const TwinAITools = ({ twinId }: TwinAIToolsProps) => {
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>(AVAILABLE_TOOLS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showToolInfo, setShowToolInfo] = useState<string | null>(null);

  const toggleTool = (toolId: string) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, enabled: !t.enabled } : t));
    const tool = tools.find(t => t.id === toolId);
    toast({
      title: tool?.enabled ? "تم التعطيل" : "تم التفعيل",
      description: `${tool?.name} ${tool?.enabled ? "معطل" : "مفعل"} للخلفية`,
    });
  };

  const toggleBackground = (toolId: string) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, background: !t.background } : t));
  };

  const categories = [...new Set(AVAILABLE_TOOLS.map(t => t.category))];
  const filteredTools = activeFilter === "all" ? tools : tools.filter(t => t.category === activeFilter);
  const enabledCount = tools.filter(t => t.enabled).length;
  const bgCount = tools.filter(t => t.background && t.enabled).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" /> أدوات الذكاء الاصطناعي العالمية
          </h2>
          <p className="text-muted-foreground">اربط توأمك بأقوى أدوات AI عالمياً — بدون الحاجة إلى أكواد برمجية</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-primary/5 to-accent/5">
          <p className="text-2xl font-bold text-foreground">{AVAILABLE_TOOLS.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي الأدوات</p>
        </Card>
        <Card className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <p className="text-2xl font-bold text-green-500">{enabledCount}</p>
          <p className="text-xs text-muted-foreground">مفعلة</p>
        </Card>
        <Card className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <p className="text-2xl font-bold text-blue-500">{bgCount}</p>
          <p className="text-xs text-muted-foreground">تعمل بالخلفية</p>
        </Card>
        <Card className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <p className="text-2xl font-bold text-amber-500">متكامل</p>
          <p className="text-xs text-muted-foreground">بدون كود</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Badge variant={activeFilter === "all" ? "default" : "outline"} className="cursor-pointer px-4 py-2 shrink-0" onClick={() => setActiveFilter("all")}>
          الجميع
        </Badge>
        {categories.map(cat => (
          <Badge key={cat} variant={activeFilter === cat ? "default" : "outline"} className="cursor-pointer px-4 py-2 shrink-0" onClick={() => setActiveFilter(cat)}>
            {cat === "search" ? "بحث" : cat === "creative" ? "إبداعي" : cat === "media" ? "وسائط" : cat === "analytics" ? "تحليل" : cat === "technical" ? "تقني" : cat === "learning" ? "تعلم" : cat === "language" ? "لغات" : cat === "system" ? "نظام" : cat}
          </Badge>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  tool.enabled ? "border-primary/30 bg-primary/[0.02]" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Switch checked={tool.enabled} onCheckedChange={() => toggleTool(tool.id)} />
                </div>
                <h4 className="font-bold text-foreground text-sm">{tool.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <Badge variant="outline" className="text-xs">{tool.provider}</Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowToolInfo(showToolInfo === tool.id ? null : tool.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {tool.enabled && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={tool.background} onChange={() => toggleBackground(tool.id)} className="sr-only peer" />
                        <div className={`w-7 h-4 rounded-full ${tool.background ? 'bg-primary' : 'bg-muted'} peer after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all ${tool.background ? 'after:translate-x-3' : ''} rtl:${tool.background ? 'after:-translate-x-3' : ''}`} />
                      </label>
                    )}
                  </div>
                </div>
                {showToolInfo === tool.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground"
                  >
                    <p className="mb-1"><span className="font-medium text-foreground">المزوّد:</span> {tool.provider}</p>
                    <p className="mb-1"><span className="font-medium text-foreground">الخلفية:</span> {tool.background ? "نشطة" : "غير نشطة"}</p>
                    <p><span className="font-medium text-foreground">ID:</span> {tool.id}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Card className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> كيف تعمل الأدوات في الخلفية؟
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Wifi className="w-4 h-4 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-1">تشغيل تلقائي</p>
            <p className="text-xs text-muted-foreground">الأدوات المفعّلة تعمل تلقائياً في الخلفية دون تدخل يدوي</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-1">بدون أكواد</p>
            <p className="text-xs text-muted-foreground">كل الأدوات جاهزة للاستخدام المباشر — لا حاجة لفتح ملفات برمجية</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <ExternalLink className="w-4 h-4 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-1">تكامل عالمي</p>
            <p className="text-xs text-muted-foreground">أقوى مزودي AI عالمياً (Google, OpenAI, ElevenLabs, وغيرهم)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TwinAITools;