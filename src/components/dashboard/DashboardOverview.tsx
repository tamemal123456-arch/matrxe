import { motion } from "framer-motion";
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: "primary" | "accent" | "secondary" | "destructive";
  delay?: number;
}

const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }: StatCardProps) => {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    secondary: "from-secondary/20 to-secondary/5 text-secondary",
    destructive: "from-destructive/20 to-destructive/5 text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-6 border border-border/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? "text-accent" : "text-destructive"}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </motion.div>
  );
};

interface DashboardOverviewProps {
  twinsCount: number;
  conversationsCount: number;
  onTabChange: (tab: string) => void;
}

const DashboardOverview = ({ twinsCount, conversationsCount, onTabChange }: DashboardOverviewProps) => {
  const navigate = useNavigate();
  const { plan, currentPlan, isPaidPlan, remaining, getLimit, getUsage } = useSubscription();
  const msgRemaining = remaining("max_messages_monthly");
  const msgLimit = getLimit("max_messages_monthly");

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                مرحباً بك في لوحة التحكم
              </h1>
              <Badge variant={isPaidPlan ? "default" : "secondary"} className={isPaidPlan ? "bg-gradient-to-r from-primary to-accent" : ""}>
                {isPaidPlan ? <Crown className="w-3 h-3 ml-1" /> : null}
                {plan?.name_ar || "مجاني"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {isPaidPlan
                ? `تبقى لديك ${msgRemaining === Infinity ? "غير محدود" : msgRemaining + " رسالة"} هذا الشهر`
                : `تبقى ${msgRemaining} من ${msgLimit} رسالة هذا الشهر`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isPaidPlan && (
              <Button variant="outline" onClick={() => onTabChange("billing")} className="gap-2">
                <Crown className="w-4 h-4" />
                ترقية
              </Button>
            )}
            <Button
              onClick={() => navigate("/create-twin")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              إنشاء توأم جديد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="التوائم الرقمية"
          value={twinsCount}
          change={12}
          icon={Bot}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="المحادثات"
          value={conversationsCount}
          change={8}
          icon={MessageSquare}
          color="accent"
          delay={0.2}
        />
        <StatCard
          title="المستخدمين النشطين"
          value="1"
          icon={Users}
          color="secondary"
          delay={0.3}
        />
        <StatCard
          title="معدل التفاعل"
          value="85%"
          change={5}
          icon={TrendingUp}
          color="primary"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">النشاط الأخير</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              عرض الكل
            </Button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">محادثة جديدة</p>
                  <p className="text-xs text-muted-foreground">منذ {i + 1} ساعة</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">البدء السريع</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/create-twin")}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">إنشاء توأم رقمي</p>
                <p className="text-xs text-muted-foreground">ابدأ بإنشاء توأمك الرقمي الأول</p>
              </div>
            </button>
            <button
              onClick={() => onTabChange("twins")}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">بدء محادثة</p>
                <p className="text-xs text-muted-foreground">تحدث مع أحد توائمك الرقمية</p>
              </div>
            </button>
            <button
              onClick={() => onTabChange("analytics")}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">عرض الإحصائيات</p>
                <p className="text-xs text-muted-foreground">تتبع أداء توائمك الرقمية</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
