import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Plus, Trash2, Star, Zap, BookOpen, Code,
  Music, Pen, Globe, BarChart3, MessageCircle, Lightbulb,
  Download, Upload, Loader2, Check, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinSkillsProps {
  twinId: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: number;
  is_active: boolean;
  icon: string;
}

const PRESET_SKILLS = [
  { name: "محادثة متقدمة", category: "communication", icon: MessageCircle, desc: "تحسين جودة الحوار والردود", baseLevel: 60 },
  { name: "تحليل البيانات", category: "analytics", icon: BarChart3, desc: "تحليل الأرقام والإحصائيات", baseLevel: 30 },
  { name: "كتابة المحتوى", category: "creative", icon: Pen, desc: "كتابة نصوص إبداعية ومقالات", baseLevel: 40 },
  { name: "البرمجة", category: "technical", icon: Code, desc: "فهم وكتابة الأكواد البرمجية", baseLevel: 20 },
  { name: "التعلم العميق", category: "learning", icon: Brain, desc: "البحث والتعلم من المصادر الخارجية", baseLevel: 50 },
  { name: "لغات متعددة", category: "language", icon: Globe, desc: "الترجمة والتحدث بلغات مختلفة", baseLevel: 70 },
  { name: "إبداع فني", category: "creative", icon: Music, desc: "توليد صور ونصوص إبداعية", baseLevel: 25 },
  { name: "بحث متقدم", category: "research", icon: BookOpen, desc: "البحث العميق في الإنترنت", baseLevel: 55 },
  { name: "تحليل المشاعر", category: "emotional", icon: Lightbulb, desc: "فهم المشاعر والرد بتعاطف", baseLevel: 65 },
];

const TwinSkills = ({ twinId }: TwinSkillsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("communication");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [training, setTraining] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchSkills();
  }, [user, twinId]);

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("twin_learned_skills")
      .select("*")
      .eq("twin_id", twinId)
      .order("level", { ascending: false });
    if (data) {
      setSkills(data.map((d: any) => ({
        id: d.id,
        name: d.skill_name || d.name,
        category: d.category || "general",
        description: d.description || "",
        level: d.level || 0,
        is_active: d.is_active !== false,
        icon: d.icon || "Brain",
      })));
    }
    setLoading(false);
  };

  const addPresetSkill = async (preset: typeof PRESET_SKILLS[0]) => {
    const exists = skills.find(s => s.name === preset.name);
    if (exists) {
      toast({ title: "موجودة مسبقاً", description: `مهارة "${preset.name}" موجودة بالفعل` });
      return;
    }
    const { error } = await supabase.from("twin_learned_skills").insert({
      twin_id: twinId,
      user_id: user?.id,
      skill_name: preset.name,
      category: preset.category,
      description: preset.desc,
      level: preset.baseLevel,
      is_active: true,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: `تم إضافة مهارة "${preset.name}"` });
      fetchSkills();
    }
  };

  const addCustomSkill = async () => {
    if (!newSkillName.trim()) return;
    const { error } = await supabase.from("twin_learned_skills").insert({
      twin_id: twinId,
      user_id: user?.id,
      skill_name: newSkillName,
      category: newSkillCategory,
      description: newSkillDesc,
      level: 10,
      is_active: true,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: `تم إضافة مهارة "${newSkillName}"` });
      setNewSkillName("");
      setNewSkillDesc("");
      setShowAddCustom(false);
      fetchSkills();
    }
  };

  const removeSkill = async (id: string) => {
    const { error } = await supabase.from("twin_learned_skills").delete().eq("id", id);
    if (!error) {
      setSkills(prev => prev.filter(s => s.id !== id));
      toast({ title: "تم", description: "تم حذف المهارة" });
    }
  };

  const trainSkill = async (skill: Skill) => {
    setTraining(skill.id);
    await new Promise(r => setTimeout(r, 1500));
    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, level: Math.min(100, s.level + Math.floor(Math.random() * 15) + 5) } : s));
    setTraining(null);
    toast({ title: "تم التدريب", description: `تم تحسين "${skill.name}"` });
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return "text-green-500";
    if (level >= 50) return "text-amber-500";
    if (level >= 30) return "text-orange-500";
    return "text-muted-foreground";
  };

  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> مهارات التوأم الرقمي
          </h2>
          <p className="text-muted-foreground">زوّد توأمك الرقمي بالمهارات التي يحتاجها لتحسين أدائه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddCustom(!showAddCustom)}>
            <Plus className="w-4 h-4 ml-1" /> مهارة مخصصة
          </Button>
        </div>
      </div>

      {showAddCustom && (
        <Card className="glass-card rounded-2xl p-6 border-primary/50">
          <h3 className="font-bold text-foreground mb-4">إضافة مهارة مخصصة</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">اسم المهارة</label>
              <Input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="مثال: تحليل السوق" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">التصنيف</label>
              <select
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="communication">تواصل</option>
                <option value="analytics">تحليل</option>
                <option value="creative">إبداعي</option>
                <option value="technical">تقني</option>
                <option value="language">لغات</option>
                <option value="research">بحث</option>
                <option value="emotional">عاطفي</option>
                <option value="general">عام</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">وصف المهارة</label>
              <Textarea value={newSkillDesc} onChange={e => setNewSkillDesc(e.target.value)} placeholder="صف ما تريد أن يتعلمه توأمك..." rows={2} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addCustomSkill} disabled={!newSkillName.trim()}>
              <Plus className="w-4 h-4 ml-1" /> إضافة المهارة
            </Button>
            <Button variant="ghost" onClick={() => { setShowAddCustom(false); setNewSkillName(""); setNewSkillDesc(""); }}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> المهارات المكتسبة
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : skills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لم يتم إضافة مهارات بعد</p>
                <p className="text-sm">اختر من المهارات الجاهزة أدناه أو أضف مهارة مخصصة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-1">
                      {cat === "communication" ? "تواصل" : cat === "analytics" ? "تحليل" : cat === "creative" ? "إبداعي" : cat === "technical" ? "تقني" : cat === "language" ? "لغات" : cat === "research" ? "بحث" : cat === "emotional" ? "عاطفي" : "عام"}
                    </p>
                    {skills.filter(s => s.category === cat).map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{skill.name}</p>
                              <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Progress value={skill.level} className="h-1.5 flex-1" />
                              <span className={`text-xs font-bold ${getLevelColor(skill.level)}`}>{skill.level}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mr-3">
                          <Button variant="ghost" size="sm" onClick={() => trainSkill(skill)} disabled={training === skill.id}>
                            {training === skill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSkill(skill.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> مهارات جاهزة
            </h3>
            <p className="text-xs text-muted-foreground mb-4">أضف مهارات جاهزة لتوأمك بنقرة واحدة</p>
            <div className="space-y-2">
              {PRESET_SKILLS.map((preset, i) => {
                const exists = skills.some(s => s.name === preset.name);
                const Icon = preset.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      exists ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border hover:border-primary/30"
                    }`}
                    onClick={() => !exists && addPresetSkill(preset)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{preset.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{preset.desc}</p>
                    </div>
                    <div className="shrink-0">
                      {exists ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Plus className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="font-bold text-foreground mb-2 text-sm">التعلم المستمر</h3>
            <p className="text-xs text-muted-foreground">
              كلما زادت مهارات توأمك، أصبح أكثر ذكاءً وفائدة. درّب مهاراتك بانتظام لرفع مستواها.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="w-3 h-3" />
              <span>{skills.length} مهارة مكتسبة</span>
              <span className="mx-1">•</span>
              <span>{Math.round(skills.reduce((a, s) => a + s.level, 0) / Math.max(skills.length, 1))}% متوسط</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwinSkills;