import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  HandMetal, MessageCircle, Mic, Volume2, Play, Pause,
  Repeat, Loader2, Upload, Sparkles, Book, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TwinSignLanguageProps {
  twinId: string;
}

const SIGN_DICTIONARY = [
  { word: "مرحباً", sign: "👋", desc: "رفع اليد مع تحريك الأصابع", type: "greeting" },
  { word: "شكراً", sign: "👍", desc: "رفع الإبهام للأعلى", type: "greeting" },
  { word: "نعم", sign: "👌", desc: "تشكيل دائرة بالإبهام والسبابة", type: "basic" },
  { word: "لا", sign: "✋", desc: "رفع الكف مع توجيه للأمام", type: "basic" },
  { word: "كيف حالك", sign: "🤷", desc: "رفع الكتفين مع فتح اليدين", type: "question" },
  { word: "أحتاج مساعدة", sign: "🆘", desc: "رفع اليد مع تحريك للأعلى والأسفل", type: "urgent" },
  { word: "أفهم", sign: "🤔", desc: "وضع الإصبع على الذقن", type: "basic" },
  { word: "لا أفهم", sign: "😕", desc: "هز الرأس مع رفع الكتفين", type: "basic" },
  { word: "سعيد", sign: "😊", desc: "رفع زوايا الفم بالأصابع", type: "feeling" },
  { word: "حزين", sign: "😢", desc: "الإشارة إلى أسفل العين", type: "feeling" },
  { word: "جائع", sign: "🍽️", desc: "الإشارة إلى الفم بحركة أكل", type: "need" },
  { word: "عطشان", sign: "🥤", desc: "تقريب اليد إلى الفم كالشرب", type: "need" },
  { word: "أين", sign: "❓", desc: "فتح الكفين مع رفع الكتفين", type: "question" },
  { word: "متى", sign: "⏰", desc: "النقر على المعصم كالساعة", type: "question" },
  { word: "لماذا", sign: "🤷‍♂️", desc: "رفع الكتفين مع فتح اليدين للأعلى", type: "question" },
  { word: "من", sign: "👤", desc: "توجيه الإصبع السبابة للأمام", type: "question" },
  { word: "أنا", sign: "👆", desc: "الإشارة إلى الصدر", type: "pronoun" },
  { word: "أنت", sign: "👉", desc: "توجيه الإصبع نحو الشخص الآخر", type: "pronoun" },
  { word: "نحن", sign: "🤝", desc: "الحركة الدائرية بين المجموعة", type: "pronoun" },
  { word: "جميل", sign: "✨", desc: "حركة دائرية للخارج من الوجه", type: "description" },
  { word: "كبير", sign: "📏", desc: "فرد اليدين بعيداً عن بعضهما", type: "description" },
  { word: "صغير", sign: "📐", desc: "تقريب اليدين مع بعضهما", type: "description" },
  { word: "توقف", sign: "✋", desc: "رفع الكف للأمام بشكل مستقيم", type: "command" },
  { word: "انتظر", sign: "⏳", desc: "رفع السبابة مع تحريك", type: "command" },
  { word: "تعال", sign: "👋", desc: "حركة جذب باليد نحو الذات", type: "command" },
  { word: "اذهب", sign: "🚶", desc: "حركة دفع باليد بعيداً", type: "command" },
  { word: "طبيب", sign: "🏥", desc: "وضع اليد على الجبهة", type: "emergency" },
  { word: "مستشفى", sign: "🏨", desc: "رسم صليب على الجبهة", type: "emergency" },
  { word: "خطر", sign: "⚠️", desc: "رفع اليدين مع تحذير", type: "emergency" },
  { word: "ألم", sign: "😣", desc: "وضع اليد على مكان الألم", type: "emergency" },
];

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "greeting", label: "تحيات" },
  { id: "basic", label: "أساسيات" },
  { id: "question", label: "أسئلة" },
  { id: "feeling", label: "مشاعر" },
  { id: "need", label: "احتياجات" },
  { id: "pronoun", label: "ضمائر" },
  { id: "description", label: "وصف" },
  { id: "command", label: "أوامر" },
  { id: "emergency", label: "طوارئ" },
];

const TwinSignLanguage = ({ twinId }: TwinSignLanguageProps) => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [signResult, setSignResult] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);

  const translateTextToSign = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const words = text.split(/\s+/);
      const translated = words.map(w => {
        const clean = w.replace(/[،.!?؟,]/g, "");
        const found = SIGN_DICTIONARY.find(s => s.word === clean);
        return found ? `${found.sign} ${found.word} (${found.desc})` : `${clean} (${w})`;
      });
      setSignResult(translated);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredDictionary = activeCategory === "all"
    ? SIGN_DICTIONARY
    : SIGN_DICTIONARY.filter(s => s.type === activeCategory);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HandMetal className="w-6 h-6 text-primary" /> لغة الإشارة للصم والبكم
        </h2>
        <p className="text-muted-foreground">تمكين التواصل مع الصم والبكم عبر لغة الإشارة الذكية</p>
      </div>

      <Tabs defaultValue="translate" className="space-y-6">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="translate" className="flex items-center gap-2">
            <Repeat className="w-4 h-4" /> ترجمة النص
          </TabsTrigger>
          <TabsTrigger value="dictionary" className="flex items-center gap-2">
            <Book className="w-4 h-4" /> قاموس الإشارات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> إعدادات الصم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translate">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">النص المراد ترجمته</h3>
              <div className="space-y-3">
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="اكتب النص الذي تريد تحويله إلى لغة إشارة..."
                  rows={4}
                  className="text-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={translateTextToSign} disabled={isTranslating || !text.trim()} variant="hero">
                    {isTranslating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <HandMetal className="w-4 h-4 ml-2" />}
                    ترجمة إلى لغة إشارة
                  </Button>
                  <Button variant="outline" onClick={() => setText("")}>مسح</Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ترجمة تلقائية</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoTranslate} onChange={e => setAutoTranslate(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                  </label>
                </div>
              </div>
            </Card>

            <Card className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" /> الترجمة بلغة الإشارة
              </h3>
              {signResult.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HandMetal className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>اكتب نصاً وترجمته إلى لغة إشارة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.div
                    animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                  >
                    <div className="text-6xl text-center mb-4">
                      {signResult.map((r, i) => {
                        const emoji = r.match(/^(\p{Emoji}+)/u)?.[0] || "👋";
                        return <span key={i} className="inline-block mx-1">{emoji}</span>;
                      })}
                    </div>
                    <p className="text-center text-sm text-muted-foreground">حركات الإشارة المقابلة</p>
                  </motion.div>
                  <div className="space-y-2">
                    {signResult.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                      >
                        <span className="text-2xl">{r.match(/^(\p{Emoji}+)/u)?.[0] || "📖"}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{r.replace(/^(\p{Emoji}+)\s*/u, "")}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const textToCopy = signResult.map(r => r.replace(/^(\p{Emoji}+)\s*/u, "")).join("\n");
                      navigator.clipboard.writeText(textToCopy);
                      toast({ title: "تم", description: "تم نسخ الترجمة" });
                    }}>
                      <MessageCircle className="w-4 h-4 ml-1" /> إرسال إلى التوأم
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({ title: "جاري التشغيل", description: "سيتم عرض الإشارات بالحركة" });
                    }}>
                      <Play className="w-4 h-4 ml-1" /> عرض بالإشارة
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dictionary">
          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 shrink-0"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDictionary.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-3xl">{entry.sign}</span>
                  <div>
                    <p className="font-medium text-foreground">{entry.word}</p>
                    <p className="text-xs text-muted-foreground">{entry.desc}</p>
                    <Badge variant="outline" className="text-xs mt-1">{entry.type}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">إعدادات التواصل للصم والبكم</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">ترجمة تلقائية للغة الإشارة</p>
                    <p className="text-xs text-muted-foreground">تحويل ردود التوأم إلى إشارات تلقائياً</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">عرض النص مع الإشارة</p>
                    <p className="text-xs text-muted-foreground">إظهار النص المكتوب مع حركات الإشارة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">اهتزاز عند التنبيهات</p>
                    <p className="text-xs text-muted-foreground">تنبيه عبر الاهتزاز للرسائل الجديدة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                  </label>
                </div>
              </div>
            </Card>

            <Card className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">التواصل مع التوأم</h3>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 text-center">
                <HandMetal className="w-16 h-16 mx-auto mb-3 text-primary opacity-50" />
                <p className="text-lg font-bold text-foreground mb-2">التوأم الرقمي يدعم لغة الإشارة</p>
                <p className="text-sm text-muted-foreground mb-4">
                  يمكن للتوأم الرقمي فهم والرد بلغة الإشارة. استخدم نافذة الترجمة للتواصل.
                </p>
                <div className="space-y-2 text-right">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-sm font-medium text-foreground">للاستفادة من ميزة الصم والبكم:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-1">
                      <li>اكتب جملتك في النص أعلاه</li>
                      <li>اضغط "ترجمة إلى لغة إشارة"</li>
                      <li>ستظهر حركات الإشارة المقابلة</li>
                      <li>يمكن إرسال النص المترجم إلى التوأم</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwinSignLanguage;