import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, Power, PowerOff, Calendar, Repeat, Loader2,
  Check, X, Trash2, Play, Pause, Bell, Zap,
  Sun, Moon, Cloud, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinOfflineTasksProps {
  twinId: string;
}

interface OfflineTask {
  id: string;
  name: string;
  description: string;
  type: "learning" | "analysis" | "maintenance" | "report" | "custom";
  schedule: "realtime" | "hourly" | "daily" | "weekly" | "custom";
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
}

const TASK_PRESETS = [
  { name: "التعلم المستمر", desc: "البحث وتعلم مواضيع جديدة بشكل دوري", type: "learning" as const, schedule: "daily" as const },
  { name: "تحليل المحادثات", desc: "تحليل أنماط المحادثات واستخراج الرؤى", type: "analysis" as const, schedule: "hourly" as const },
  { name: "صيانة الذاكرة", desc: "تنظيف وتحسين الذاكرة طويلة المدى", type: "maintenance" as const, schedule: "daily" as const },
  { name: "تقرير أسبوعي", desc: "إنشاء تقرير أسبوعي عن أداء التوأم", type: "report" as const, schedule: "weekly" as const },
  { name: "فحص أمني", desc: "فحص أمني دوري للنظام", type: "maintenance" as const, schedule: "daily" as const },
  { name: "تحديث المعرفة", desc: "تحديث قاعدة المعرفة بمعلومات جديدة", type: "learning" as const, schedule: "hourly" as const },
];

const TwinOfflineTasks = ({ twinId }: TwinOfflineTasksProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [customTaskName, setCustomTaskName] = useState("");
  const [customTaskDesc, setCustomTaskDesc] = useState("");
  const [customTaskSchedule, setCustomTaskSchedule] = useState("daily");
  const [customTaskType, setCustomTaskType] = useState("learning");

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, twinId]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("twin_offline_tasks")
      .select("*")
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  };

  const addPresetTask = async (preset: typeof TASK_PRESETS[0]) => {
    const exists = tasks.some(t => t.name === preset.name);
    if (exists) {
      toast({ title: "موجودة مسبقاً", description: `المهمة "${preset.name}" موجودة بالفعل` });
      return;
    }
    const { error } = await supabase.from("twin_offline_tasks").insert({
      twin_id: twinId,
      user_id: user?.id,
      name: preset.name,
      description: preset.desc,
      type: preset.type,
      schedule: preset.schedule,
      is_active: true,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: `تم تفعيل "${preset.name}"` });
      fetchTasks();
    }
  };

  const toggleTask = async (task: OfflineTask) => {
    const { error } = await supabase
      .from("twin_offline_tasks")
      .update({ is_active: !task.is_active })
      .eq("id", task.id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_active: !t.is_active } : t));
      toast({ title: task.is_active ? "تم الإيقاف" : "تم التشغيل", description: `"${task.name}"` });
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("twin_offline_tasks").delete().eq("id", id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: "تم", description: "تم حذف المهمة" });
    }
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      learning: { label: "تعلم", color: "bg-blue-500/20 text-blue-500" },
      analysis: { label: "تحليل", color: "bg-purple-500/20 text-purple-500" },
      maintenance: { label: "صيانة", color: "bg-amber-500/20 text-amber-500" },
      report: { label: "تقرير", color: "bg-green-500/20 text-green-500" },
      custom: { label: "مخصص", color: "bg-gray-500/20 text-gray-500" },
    };
    return map[type] || map.custom;
  };

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case "realtime": return <Zap className="w-3 h-3" />;
      case "hourly": return <Clock className="w-3 h-3" />;
      case "daily": return <Sun className="w-3 h-3" />;
      case "weekly": return <Calendar className="w-3 h-3" />;
      default: return <Repeat className="w-3 h-3" />;
    }
  };

  const activeCount = tasks.filter(t => t.is_active).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> المهام غير المتصلة (Offline)
          </h2>
          <p className="text-muted-foreground">تنفيذ المهام في الخلفية حتى بعد تسجيل الخروج</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>وضع عدم الاتصال</span>
            <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>
          <Badge variant={offlineMode ? "default" : "outline"} className="text-sm px-3 py-1">
            {offlineMode ? <><Zap className="w-3 h-3 ml-1" /> نشط</> : <><PowerOff className="w-3 h-3 ml-1" /> معطل</>}
          </Badge>
        </div>
      </div>

      {!offlineMode && (
        <Card className="glass-card rounded-2xl p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <div className="flex items-center gap-3">
            <PowerOff className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-bold text-foreground">وضع عدم الاتصال معطل</p>
              <p className="text-sm text-muted-foreground">فعّل وضع عدم الاتصال لتستمر المهام في العمل حتى بعد خروجك من حساب التوأم الرقمي</p>
            </div>
            <Button variant="hero" size="sm" onClick={() => { setOfflineMode(true); toast({ title: "تم التفعيل", description: "المهام ستعمل في الخلفية بعد تسجيل الخروج" }); }}>
              <Zap className="w-4 h-4 ml-1" /> تفعيل
            </Button>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> المهام المجدولة
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{activeCount} من {tasks.length} نشطة</span>
                <Button variant="outline" size="sm" onClick={() => setShowAddPreset(!showAddPreset)}>
                  <Play className="w-4 h-4 ml-1" /> إضافة مهام جاهزة
                </Button>
              </div>
            </div>

            {showAddPreset && (
              <div className="mb-4 p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm font-medium text-foreground mb-3">المهام الجاهزة:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {TASK_PRESETS.map((preset, i) => {
                    const exists = tasks.some(t => t.name === preset.name);
                    return (
                      <button
                        key={i}
                        className={`flex items-center gap-2 p-3 rounded-xl text-right text-sm border transition-all ${
                          exists ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border hover:border-primary/30"
                        }`}
                        onClick={() => !exists && addPresetTask(preset)}
                        disabled={exists}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeBadge(preset.type).color}`}>
                          {preset.type === "learning" ? "📚" : preset.type === "analysis" ? "📊" : preset.type === "maintenance" ? "🔧" : preset.type === "report" ? "📋" : "⚙️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-xs">{preset.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{preset.desc}</p>
                        </div>
                        {exists && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : tasks.length === 0 && !showAddPreset ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد مهام مجدولة</p>
                <p className="text-sm">أضف مهاماً جاهزة أو أنشئ مهمة مخصصة</p>
                <Button variant="hero" size="sm" className="mt-4" onClick={() => setShowAddPreset(true)}>
                  <Play className="w-4 h-4 ml-1" /> إضافة مهام جاهزة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      task.is_active ? "bg-muted/30 border-border" : "bg-muted/10 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl ${getTypeBadge(task.type).color} bg-opacity-20 flex items-center justify-center`}>
                        {task.type === "learning" ? "📚" : task.type === "analysis" ? "📊" : task.type === "maintenance" ? "🔧" : task.type === "report" ? "📋" : "⚙️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{task.name}</p>
                          <Badge className={`text-xs ${getTypeBadge(task.type).color}`}>{getTypeBadge(task.type).label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">{getScheduleIcon(task.schedule)} {task.schedule === "realtime" ? "فوري" : task.schedule === "hourly" ? "كل ساعة" : task.schedule === "daily" ? "يومي" : task.schedule === "weekly" ? "أسبوعي" : "مخصص"}</span>
                          {task.last_run && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> آخر: {new Date(task.last_run).toLocaleDateString("ar")}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mr-3">
                      <Switch checked={task.is_active} onCheckedChange={() => toggleTask(task)} />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> الإحصائيات
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">إجمالي المهام</span>
                <span className="font-bold">{tasks.length}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">النشطة حالياً</span>
                <span className="font-bold text-green-500">{activeCount}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">وضع عدم الاتصال</span>
                <span className={`font-bold ${offlineMode ? "text-primary" : "text-muted-foreground"}`}>{offlineMode ? "مفعل" : "معطل"}</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="font-bold text-foreground mb-2 text-sm">كيف تعمل المهام غير المتصلة؟</h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Zap className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <span>المهام تستمر في العمل على الخوادم حتى بعد تسجيل الخروج</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <span>يتم تنفيذ المهام حسب الجدول الزمني المحدد</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <span>ستتلقى إشعاراً عند اكتمال المهمة عند عودتك</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwinOfflineTasks;