// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Mic, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  User,
  Brain,
  Zap,
  FileAudio,
  Eye,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import VoiceRecorder from "@/components/VoiceRecorder";
import TwinPreview from "@/components/TwinPreview";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'voice' | 'image';
}

const steps = [
  { id: 1, title: "المعلومات الأساسية", icon: User },
  { id: 2, title: "رفع الصور", icon: ImageIcon },
  { id: 3, title: "عينات الصوت", icon: Mic },
  { id: 4, title: "تخصيص الشخصية", icon: Brain },
];

const CreateTwin = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    language: "ar",
  });
  const [voiceFiles, setVoiceFiles] = useState<UploadedFile[]>([]);
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloningVoice, setIsCloningVoice] = useState(false);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `avatars/${user?.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from("twin-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("twin-images")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "فشل رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة إلى الخادم",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'voice' | 'image') => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, type);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'voice' | 'image') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files, type);
    }
  };

  const handleFiles = (files: File[], type: 'voice' | 'image') => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: type === 'image' ? URL.createObjectURL(file) : undefined,
      type,
    }));

    if (type === 'voice') {
      setVoiceFiles(prev => [...prev, ...newFiles]);
    } else {
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string, type: 'voice' | 'image') => {
    if (type === 'voice') {
      setVoiceFiles(prev => prev.filter(f => f.id !== id));
    } else {
      const file = imageFiles.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      setImageFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اسم التوأم الرقمي</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم توأمك الرقمي"
                className="glass-card border-border/50 focus:border-primary/50 bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">وصف مختصر</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="صف توأمك الرقمي بإيجاز..."
                className="glass-card border-border/50 focus:border-primary/50 bg-background/50 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اللغة الأساسية</label>
              <div className="flex gap-3">
                {[
                  { code: "ar", label: "العربية", flag: "🇸🇦" },
                  { code: "en", label: "English", flag: "🇺🇸" },
                  { code: "fr", label: "Français", flag: "🇫🇷" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setFormData(prev => ({ ...prev, language: lang.code }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      formData.language === lang.code
                        ? "glass-card border-primary/50 bg-primary/10 text-primary"
                        : "glass-card border-border/30 hover:border-border/50"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <p className="text-muted-foreground">ارفع صور واضحة لوجهك من زوايا مختلفة (3-10 صور)</p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'image')}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileInput(e, 'image')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">اسحب الصور هنا أو انقر للاختيار</p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP (حد أقصى 10MB لكل صورة)</p>
                </div>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square rounded-xl overflow-hidden glass-card"
                  >
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(file.id, 'image')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <p className="text-muted-foreground">سجّل صوتك مباشرة أو ارفع عينات صوتية (3-5 دقائق إجمالاً)</p>
            </div>

            {/* Voice Recorder */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mic className="w-4 h-4 text-accent" />
                <span>التسجيل المباشر</span>
              </div>
              <VoiceRecorder 
                onRecordingComplete={(file) => {
                  const newFile = {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    type: 'voice' as const,
                  };
                  setVoiceFiles(prev => [...prev, newFile]);
                }}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-sm text-muted-foreground">أو</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileAudio className="w-4 h-4 text-primary" />
                <span>رفع ملفات صوتية</span>
              </div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'voice')}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragging
                    ? "border-accent bg-accent/10"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => handleFileInput(e, 'voice')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">اسحب ملفات الصوت هنا أو انقر للاختيار</p>
                    <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, WEBM (حد أقصى 50MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {voiceFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">الملفات المضافة ({voiceFiles.length})</p>
                {voiceFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl glass-card"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id, 'voice')}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Voice Cloning Button */}
            {voiceFiles.length > 0 && !clonedVoiceId && (
              <div className="glass-card rounded-xl p-4 border-accent/30 bg-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">استنساخ صوتك</p>
                      <p className="text-xs text-muted-foreground">
                        انقر لإنشاء صوت رقمي مطابق لصوتك
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    disabled={isCloningVoice || !formData.name}
                    onClick={async () => {
                      if (voiceFiles.length === 0) return;
                      
                      setIsCloningVoice(true);
                      try {
                        const formDataToSend = new FormData();
                        formDataToSend.append("name", `${formData.name}-voice`);
                        formDataToSend.append("description", `Digital Twin voice for ${formData.name}`);
                        
                        // Add all voice files
                        voiceFiles.forEach((file, index) => {
                          formDataToSend.append(`audio_${index}`, file.file);
                        });

                        const token = await getAccessToken();
                        const response = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clone-voice`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formDataToSend,
                          }
                        );

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || "Failed to clone voice");
                        }

                        const result = await response.json();
                        setClonedVoiceId(result.voice_id);
                        
                        toast({
                          title: "تم استنساخ الصوت بنجاح!",
                          description: "سيستخدم توأمك الرقمي صوتك الآن",
                        });
                      } catch (error) {
                        console.error("Voice cloning error:", error);
                        toast({
                          title: "فشل استنساخ الصوت",
                          description: error instanceof Error ? error.message : "حدث خطأ أثناء استنساخ الصوت",
                          variant: "destructive",
                        });
                      } finally {
                        setIsCloningVoice(false);
                      }
                    }}
                  >
                    {isCloningVoice ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "استنساخ الصوت"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Voice Cloned Success */}
            {clonedVoiceId && (
              <div className="glass-card rounded-xl p-4 border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">تم استنساخ صوتك بنجاح!</p>
                    <p className="text-xs text-muted-foreground">
                      سيتحدث توأمك الرقمي بصوت مطابق لصوتك
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="glass-card rounded-xl p-4 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">نصائح للحصول على أفضل نتيجة</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>سجّل في مكان هادئ بدون ضوضاء خلفية</li>
                    <li>تحدث بوضوح وبسرعة طبيعية</li>
                    <li>استخدم ميكروفون عالي الجودة إن أمكن</li>
                    <li>سجّل 3-5 دقائق للحصول على أفضل استنساخ</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">شخصية التوأم</label>
              <Textarea
                value={formData.personality}
                onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                placeholder="صف شخصية توأمك الرقمي... هل هو ودود؟ احترافي؟ مرح؟"
                className="glass-card border-border/50 focus:border-primary/50 bg-background/50 min-h-[120px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">أنماط شخصية مقترحة</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ودود ومرح", emoji: "😊" },
                  { label: "احترافي ورسمي", emoji: "💼" },
                  { label: "مبدع وملهم", emoji: "✨" },
                  { label: "هادئ وحكيم", emoji: "🧘" },
                ].map((style) => (
                  <button
                    key={style.label}
                    onClick={() => setFormData(prev => ({ ...prev, personality: style.label }))}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                      formData.personality === style.label
                        ? "glass-card border-primary/50 bg-primary/10"
                        : "glass-card border-border/30 hover:border-border/50"
                    }`}
                  >
                    <span className="text-2xl">{style.emoji}</span>
                    <span className="text-sm font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Eye className="w-4 h-4 text-primary" />
                <span>معاينة حية للتوأم</span>
              </div>
              <TwinPreview 
                twinName={formData.name}
                personality={formData.personality}
                avatarImage={imageFiles[0]?.preview}
              />
            </div>

            {/* Summary */}
            <div className="glass-card rounded-xl p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                ملخص التوأم الرقمي
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="font-medium text-foreground">{formData.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الصور:</span>
                  <span className="font-medium text-foreground">{imageFiles.length} صور</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العينات الصوتية:</span>
                  <span className="font-medium text-foreground">{voiceFiles.length} ملفات</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشخصية:</span>
                  <span className="font-medium text-foreground">{formData.personality || "—"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">أنشئ توأمك الرقمي</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              اتبع الخطوات البسيطة لإنشاء نسخة رقمية ذكية منك
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border/50" />
              <div 
                className="absolute top-6 right-0 h-0.5 bg-gradient-to-l from-primary to-accent transition-all"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"
                          : isCompleted
                          ? "bg-primary/20 text-primary"
                          : "glass-card text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="hero"
                onClick={nextStep}
                className="gap-2"
              >
                التالي
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                className="gap-2"
                disabled={isSubmitting || !formData.name}
                onClick={async () => {
                  if (!user) {
                    toast({
                      title: "يجب تسجيل الدخول",
                      description: "يرجى تسجيل الدخول لإنشاء توأم رقمي",
                      variant: "destructive",
                    });
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    let avatarUrl: string | null = null;
                    if (imageFiles.length > 0) {
                      avatarUrl = await uploadImageToStorage(imageFiles[0].file);
                    }

                    const { error } = await supabase
                      .from("digital_twins")
                      .insert({
                        user_id: user.id,
                        name: formData.name,
                        personality: formData.personality || null,
                        knowledge_base: formData.description || null,
                        voice_samples_count: voiceFiles.length,
                        avatar_url: avatarUrl,
                        voice_id: clonedVoiceId || null,
                        status: clonedVoiceId ? "active" : "draft",
                      });

                    if (error) throw error;

                    toast({
                      title: "تم الإنشاء بنجاح!",
                      description: "تم إنشاء توأمك الرقمي بنجاح",
                    });
                    navigate("/dashboard");
                  } catch (error) {
                    console.error("Error creating twin:", error);
                    toast({
                      title: "خطأ",
                      description: "فشل في إنشاء التوأم الرقمي",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    إنشاء التوأم
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateTwin;
