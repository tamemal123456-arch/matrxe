import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Bot,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

interface DigitalTwin {
  id: string;
  name: string;
  personality: string | null;
  status: string;
  voice_samples_count: number;
  avatar_url: string | null;
  created_at: string;
}

interface DashboardTwinsProps {
  twins: DigitalTwin[];
  onTwinsChange: (twins: DigitalTwin[]) => void;
  onSelectTwin?: (id: string, name: string) => void;
}

const DashboardTwins = ({ twins, onTwinsChange, onSelectTwin }: DashboardTwinsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlan, getLimit, remaining, isPaidPlan } = useSubscription();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTwins = twins.filter(twin =>
    twin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedTwin) return;

    try {
      const { error } = await supabase
        .from("digital_twins")
        .delete()
        .eq("id", selectedTwin.id);

      if (error) throw error;

      onTwinsChange(twins.filter((t) => t.id !== selectedTwin.id));
      toast({
        title: "تم الحذف",
        description: "تم حذف التوأم الرقمي بنجاح",
      });
    } catch (error) {
      console.error("Error deleting twin:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف التوأم الرقمي",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTwin(null);
    }
  };

  const toggleStatus = async (twin: DigitalTwin) => {
    const newStatus = twin.status === "active" ? "paused" : "active";

    try {
      const { error } = await supabase
        .from("digital_twins")
        .update({ status: newStatus })
        .eq("id", twin.id);

      if (error) throw error;

      onTwinsChange(
        twins.map((t) => (t.id === twin.id ? { ...t, status: newStatus } : t))
      );
      toast({
        title: newStatus === "active" ? "تم التفعيل" : "تم الإيقاف",
        description: `تم ${newStatus === "active" ? "تفعيل" : "إيقاف"} التوأم الرقمي`,
      });
    } catch (error) {
      console.error("Error updating twin status:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التوأم",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent";
      case "training":
        return "bg-yellow-500";
      case "paused":
        return "bg-muted-foreground";
      default:
        return "bg-primary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "training":
        return "جاري التدريب";
      case "paused":
        return "متوقف";
      default:
        return "مسودة";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">التوائم الرقمية</h1>
          <p className="text-muted-foreground">إدارة وتخصيص توائمك الرقمية</p>
        </div>
          <Button
            onClick={() => {
              const limit = getLimit("max_twins");
              if (twins.length >= limit) {
                toast({ title: "تم الوصول للحد الأقصى", description: `خطتك تسمح بـ ${limit === Infinity ? "غير محدود" : limit + " توائم"}. قم بالترقية لإضافة المزيد.`, variant: "destructive" });
                return;
              }
              navigate("/create-twin");
            }}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Plus className="w-5 h-5 ml-2" />
            {twins.length > 0 ? "إنشاء توأم جديد" : "إنشاء أول توأم"}
          </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن توأم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          تصفية
        </Button>
      </div>

      {/* Twins Grid */}
      {filteredTwins.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 glass-card rounded-2xl border border-border/50"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Bot className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? "لا توجد نتائج" : "لا توجد توائم رقمية بعد"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "جرب البحث بكلمات أخرى" : "ابدأ بإنشاء توأمك الرقمي الأول"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => navigate("/create-twin")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              إنشاء توأم رقمي
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTwins.map((twin, index) => (
            <motion.div
              key={twin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                    {twin.avatar_url ? (
                      <img
                        src={twin.avatar_url}
                        alt={twin.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {twin.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(twin.status)}`} />
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(twin.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleStatus(twin)}>
                      {twin.status === "active" ? (
                        <>
                          <Pause className="w-4 h-4 ml-2" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 ml-2" />
                          تفعيل
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedTwin(twin);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {twin.personality && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {twin.personality}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{twin.voice_samples_count} عينات</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(twin.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 justify-center hover:bg-primary/10 hover:text-primary"
                  onClick={() => navigate(`/chat/${twin.id}`)}
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  محادثة
                </Button>
                {onSelectTwin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    onClick={() => onSelectTwin(twin.id, twin.name)}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    إدارة
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التوأم الرقمي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{selectedTwin?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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

export default DashboardTwins;
