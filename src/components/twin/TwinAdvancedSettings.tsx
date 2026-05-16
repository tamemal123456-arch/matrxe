import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save, Image, Mic, Type, Brain, Volume2, Upload,
  Sparkles, RefreshCw, Play, Pause, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinData {
  id: string;
  name: string;
  personality: string | null;
  status: string;
  avatar_url: string | null;
  voice_id: string | null;
  voice_samples_count: number;
  knowledge_base: string | null;
}

interface TwinAdvancedSettingsProps {
  twin: TwinData;
  onUpdate: () => void;
}

const TONES = [
  { value: "professional", label: "رسمي/مهني" },
  { value: "friendly", label: "ودود" },
  { value: "humorous", label: "فكاهي" },
  { value: "formal", label: "رسمي" },
  { value: "creative", label: "إبداعي" },
  { value: "empathetic", label: "متعاطف" },
  { value: "custom", label: "مخصص" },
];

const PERSONALITY_TRAITS = [
  "ذكي", "مبدع", "دبلوماسي", "مباشر", "صريح",
  "متفائل", "عملي", "تحليلي", "اجتماعي", "فضولي"
];

const TwinAdvancedSettings = ({ twin, onUpdate }: TwinAdvancedSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(twin.name);
  const [personality, setPersonality] = useState(twin.personality || "");
  const [tone, setTone] = useState("friendly");
  const [knowledgeBase, setKnowledgeBase] = useState(twin.knowledge_base || "");
  const [status, setStatus] = useState(twin.status || "active");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewTone, setPreviewTone] = useState(false);

  useEffect(() => {
    setName(twin.name);
    setPersonality(twin.personality || "");
    setKnowledgeBase(twin.knowledge_base || "");
    setStatus(twin.status || "active");
  }, [twin.id]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن لا يتجاوز 5MB", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return twin.avatar_url;
    setUploadingAvatar(true);
    try {
      const ext = avatarFile.name.split(".").pop() || "png";
      const filePath = `avatars/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("twin-images")
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("twin-images")
        .getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
      return twin.avatar_url;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "خطأ", description: "اسم التوأم مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = twin.avatar_url;
      if (avatarFile) {
        const uploaded = await uploadAvatar();
        if (uploaded) avatarUrl = uploaded;
      }
      const { error } = await supabase
        .from("digital_twins")
        .update({
          name,
          personality,
          status,
          avatar_url: avatarUrl,
          knowledge_base: knowledgeBase || null,
        })
        .eq("id", twin.id);
      if (error) throw error;
      toast({ title: "تم", description: "تم حفظ إعدادات التوأم بنجاح" });
      onUpdate();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleTrait = (trait: string) => {
    const traits = personality ? personality.split(", ") : [];
    if (traits.includes(trait)) {
      setPersonality(traits.filter(t => t !== trait).join(", "));
    } else {
      setPersonality([...traits, trait].join(", "));
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إعدادات التوأم الرقمي</h2>
          <p className="text-muted-foreground">خصص مظهر وصوت وشخصية توأمك الرقمي</p>
        </div>
        <Button onClick={handleSave} disabled={saving} variant="hero">
          {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* الاسم والحالة */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" /> المعلومات الأساسية
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">اسم التوأم</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="اسم التوأم الرقمي" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الحالة</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="paused">متوقف مؤقتاً</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* الشخصية والصفات */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> الشخصية والصفات
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">الأسلوب العام</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">الصفات الشخصية (اختر واحدة أو أكثر)</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map(trait => {
                  const selected = personality?.includes(trait);
                  return (
                    <Badge
                      key={trait}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">وصف الشخصية (نص حر)</label>
              <Textarea
                value={personality}
                onChange={e => setPersonality(e.target.value)}
                placeholder="صف شخصية توأمك الرقمي... مثال: طموح، محب للمعرفة، يتحدث بأسلوب ودود..."
                rows={3}
              />
            </div>
          </Card>

          {/* قاعدة المعرفة */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> قاعدة المعرفة
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              أضف معلومات خاصة تريد أن يعرفها توأمك الرقمي عنك أو عن موضوع معين
            </p>
            <Textarea
              value={knowledgeBase}
              onChange={e => setKnowledgeBase(e.target.value)}
              placeholder="مثال: أنا أعمل في مجال التسويق، أحب السفر، لدي خبرة في الذكاء الاصطناعي..."
              rows={6}
              className="font-mono text-sm"
            />
          </Card>
        </div>

        <div className="space-y-6">
          {/* الصورة الرمزية */}
          <Card className="glass-card rounded-2xl p-6 text-center">
            <h3 className="font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Image className="w-5 h-5 text-primary" /> الصورة الرمزية
            </h3>
            <div
              className="w-32 h-32 rounded-2xl mx-auto mb-4 bg-muted overflow-hidden cursor-pointer relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {(avatarPreview || twin.avatar_url) ? (
                <img
                  src={avatarPreview || twin.avatar_url || ""}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Image className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <p className="text-xs text-muted-foreground">اضغط لتغيير الصورة (5MB كحد أقصى)</p>
          </Card>

          {/* الصوت */}
          <Card className="glass-card rounded-2xl p-6 text-center">
            <h3 className="font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Mic className="w-5 h-5 text-primary" /> الصوت
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">معاينة الصوت</span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewTone(!previewTone)}>
                  {previewTone ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="text-right">
                  <p className="text-sm text-foreground">عينات صوتية</p>
                  <p className="text-xs text-muted-foreground">{twin.voice_samples_count || 0} عينة</p>
                </div>
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/chat/${twin.id}`}>تسجيل صوت جديد ←</a>
              </Button>
            </div>
          </Card>

          {/* معاينة الأسلوب */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> معاينة الأسلوب
            </h3>
            <div className="p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">رد توأمك سيبدو هكذا:</p>
              <p className="italic">
                {tone === "professional" ? "أهلاً بك، يسعدني مساعدتك. كيف يمكنني خدمتك اليوم؟" :
                 tone === "friendly" ? "مرحباً! كيف حالك؟ أنا هنا لمساعدتك في أي وقت 😊" :
                 tone === "humorous" ? "هاها، مرحباً! مستعد للرد على أي سؤال (حتى الغريب منه)!" :
                 tone === "formal" ? "السلام عليكم ورحمة الله وبركاته. يشرفني تقديم المساعدة." :
                 tone === "creative" ? "أهلاً! أفكار جديدة في انتظارنا. ماذا سنبدع اليوم؟ ✨" :
                 tone === "empathetic" ? "أهلاً بك، أنا هنا لأجلك. أخبرني ما الذي يخطر ببالك." :
                 "مرحباً! كيف يمكنني مساعدتك اليوم؟"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwinAdvancedSettings;