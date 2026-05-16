import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Sparkles,
  MessageSquare,
  Calendar,
  Search,
  Settings,
  Lock,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TwinTask {
  id: string;
  twin_id: string;
  name: string;
  description: string | null;
  category: string;
  instructions: string | null;
  is_enabled: boolean;
  created_at: string;
}

interface DigitalTwin {
  id: string;
  name: string;
}

interface TwinTasksManagerProps {
  twins: DigitalTwin[];
  userPlan: string;
}

const taskCategories = [
  { value: "general", label: "عام", icon: "💬" },
  { value: "customer_support", label: "دعم العملاء", icon: "🎧" },
  { value: "sales", label: "المبيعات", icon: "💼" },
  { value: "scheduling", label: "الجدولة", icon: "📅" },
  { value: "content", label: "إنشاء المحتوى", icon: "✍️" },
  { value: "research", label: "البحث", icon: "🔍" },
  { value: "custom", label: "مخصص", icon: "⚙️" },
];

const TwinTasksManager = ({ twins, userPlan }: TwinTasksManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TwinTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTwin, setSelectedTwin] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TwinTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TwinTask | null>(null);
  const [formData, setFormData] = useState({
    twin_id: "",
    name: "",
    description: "",
    category: "general",
    instructions: "",
  });

  const isPaidPlan = userPlan === "pro" || userPlan === "enterprise";

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("twin_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المهام",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.twin_id) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("twin_tasks")
          .update({
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            instructions: formData.instructions || null,
          })
          .eq("id", editingTask.id);

        if (error) throw error;

        setTasks(tasks.map(t => 
          t.id === editingTask.id 
            ? { ...t, ...formData, description: formData.description || null, instructions: formData.instructions || null }
            : t
        ));

        toast({
          title: "تم التحديث",
          description: "تم تحديث المهمة بنجاح",
        });
      } else {
        const { data, error } = await supabase
          .from("twin_tasks")
          .insert({
            twin_id: formData.twin_id,
            user_id: user?.id,
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            instructions: formData.instructions || null,
          })
          .select()
          .single();

        if (error) throw error;

        setTasks([data, ...tasks]);

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المهمة بنجاح",
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المهمة",
        variant: "destructive",
      });
    }
  };

  const handleToggleEnabled = async (task: TwinTask) => {
    try {
      const { error } = await supabase
        .from("twin_tasks")
        .update({ is_enabled: !task.is_enabled })
        .eq("id", task.id);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, is_enabled: !t.is_enabled } : t
      ));

      toast({
        title: task.is_enabled ? "تم الإيقاف" : "تم التفعيل",
        description: `تم ${task.is_enabled ? "إيقاف" : "تفعيل"} المهمة بنجاح`,
      });
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المهمة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from("twin_tasks")
        .delete()
        .eq("id", taskToDelete.id);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskToDelete.id));

      toast({
        title: "تم الحذف",
        description: "تم حذف المهمة بنجاح",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المهمة",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      twin_id: twins.length > 0 ? twins[0].id : "",
      name: "",
      description: "",
      category: "general",
      instructions: "",
    });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (task: TwinTask) => {
    setEditingTask(task);
    setFormData({
      twin_id: task.twin_id,
      name: task.name,
      description: task.description || "",
      category: task.category,
      instructions: task.instructions || "",
    });
    setIsDialogOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTwin = selectedTwin === "all" || task.twin_id === selectedTwin;
    return matchesSearch && matchesTwin;
  });

  const getTwinName = (twinId: string) => {
    return twins.find(t => t.id === twinId)?.name || "غير معروف";
  };

  const getCategoryInfo = (category: string) => {
    return taskCategories.find(c => c.value === category) || taskCategories[0];
  };

  if (!isPaidPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 border border-border/50 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">ميزة حصرية للخطط المدفوعة</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          قم بترقية خطتك للوصول إلى ميزة تخصيص مهام التوأم الرقمي وإضافة قدرات مخصصة لتوائمك
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground">متاحة في خطة احترافي ومؤسسات</span>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Sparkles className="w-4 h-4 ml-2" />
          ترقية الخطة
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">مهام التوأم الرقمي</h2>
          <p className="text-muted-foreground text-sm">خصص قدرات ومهام توائمك الرقمية</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ ...formData, twin_id: twins[0]?.id || "" });
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          disabled={twins.length === 0}
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة مهمة
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن مهمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-muted/50 border-border/50"
          />
        </div>
        <Select value={selectedTwin} onValueChange={setSelectedTwin}>
          <SelectTrigger className="w-[200px] bg-muted/50 border-border/50">
            <SelectValue placeholder="جميع التوائم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التوائم</SelectItem>
            {twins.map((twin) => (
              <SelectItem key={twin.id} value={twin.id}>
                {twin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 glass-card rounded-2xl border border-border/50"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <ListTodo className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            {searchQuery ? "لا توجد نتائج" : "لا توجد مهام بعد"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "جرب البحث بكلمات أخرى" : "أضف مهام لتخصيص قدرات توائمك الرقمية"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredTasks.map((task, index) => {
              const categoryInfo = getCategoryInfo(task.category);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card rounded-xl p-5 border transition-all ${
                    task.is_enabled ? "border-border/50 hover:border-primary/30" : "border-border/30 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                        {categoryInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{task.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {categoryInfo.label}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {getTwinName(task.twin_id)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.created_at).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={task.is_enabled}
                        onCheckedChange={() => handleToggleEnabled(task)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 hover:bg-primary/10 hover:text-primary"
                      onClick={() => openEditDialog(task)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "قم بتعديل تفاصيل المهمة" : "أضف مهمة جديدة لتخصيص قدرات توأمك الرقمي"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingTask && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">التوأم الرقمي</label>
                <Select 
                  value={formData.twin_id} 
                  onValueChange={(value) => setFormData({ ...formData, twin_id: value })}
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="اختر التوأم" />
                  </SelectTrigger>
                  <SelectContent>
                    {twins.map((twin) => (
                      <SelectItem key={twin.id} value={twin.id}>
                        {twin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اسم المهمة *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: الرد على استفسارات العملاء"
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">الفئة</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للمهمة..."
                className="bg-muted/50 border-border/50 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">تعليمات تنفيذ المهمة</label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="أضف تعليمات محددة لكيفية تنفيذ هذه المهمة..."
                className="bg-muted/50 border-border/50 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                هذه التعليمات ستُستخدم لتوجيه التوأم الرقمي في تنفيذ المهمة
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {editingTask ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة المهمة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المهمة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{taskToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TwinTasksManager;
