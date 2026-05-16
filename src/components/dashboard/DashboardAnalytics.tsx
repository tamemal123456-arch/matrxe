import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bot,
  Clock,
  Users,
  Activity,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const weeklyData = [
  { day: "السبت", messages: 12, conversations: 3 },
  { day: "الأحد", messages: 19, conversations: 5 },
  { day: "الإثنين", messages: 8, conversations: 2 },
  { day: "الثلاثاء", messages: 25, conversations: 7 },
  { day: "الأربعاء", messages: 32, conversations: 8 },
  { day: "الخميس", messages: 18, conversations: 4 },
  { day: "الجمعة", messages: 22, conversations: 6 },
];

const monthlyData = [
  { month: "يناير", twins: 1, messages: 45 },
  { month: "فبراير", twins: 2, messages: 78 },
  { month: "مارس", twins: 2, messages: 120 },
  { month: "أبريل", twins: 3, messages: 180 },
];

const chartConfig = {
  messages: {
    label: "الرسائل",
    color: "hsl(199 89% 48%)",
  },
  conversations: {
    label: "المحادثات",
    color: "hsl(152 76% 50%)",
  },
  twins: {
    label: "التوائم",
    color: "hsl(270 70% 50%)",
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card rounded-xl p-5 border border-border/50"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-xs text-primary mt-1">{subtitle}</p>
  </motion.div>
);

interface DashboardAnalyticsProps {
  twinsCount: number;
  conversationsCount: number;
}

const DashboardAnalytics = ({ twinsCount, conversationsCount }: DashboardAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">الإحصائيات</h1>
        <p className="text-muted-foreground">تتبع أداء توائمك الرقمية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي التوائم"
          value={twinsCount}
          subtitle="+1 هذا الشهر"
          icon={Bot}
          delay={0.1}
        />
        <StatCard
          title="المحادثات"
          value={conversationsCount}
          subtitle="+5 هذا الأسبوع"
          icon={MessageSquare}
          delay={0.2}
        />
        <StatCard
          title="الرسائل"
          value="136"
          subtitle="+23 اليوم"
          icon={Activity}
          delay={0.3}
        />
        <StatCard
          title="متوسط وقت الرد"
          value="2.3s"
          subtitle="تحسن 15%"
          icon={Clock}
          delay={0.4}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Messages Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">الرسائل الأسبوعية</h3>
              <p className="text-sm text-muted-foreground">آخر 7 أيام</p>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 18%)" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(215 20% 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(215 20% 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="hsl(199 89% 48%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>

        {/* Monthly Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">النمو الشهري</h3>
              <p className="text-sm text-muted-foreground">آخر 4 أشهر</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">الرسائل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-muted-foreground">التوائم</span>
              </div>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 18%)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(215 20% 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(215 20% 65%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="messages" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="twins" fill="hsl(270 70% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6 border border-border/50"
      >
        <h3 className="font-semibold text-foreground mb-6">مؤشرات الأداء</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">معدل الرضا</span>
              <span className="text-sm font-medium text-foreground">92%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">دقة الردود</span>
              <span className="text-sm font-medium text-foreground">88%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[88%] bg-gradient-to-r from-accent to-secondary rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">معدل التفاعل</span>
              <span className="text-sm font-medium text-foreground">85%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-secondary to-primary rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardAnalytics;
