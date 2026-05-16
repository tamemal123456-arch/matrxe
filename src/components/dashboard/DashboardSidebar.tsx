import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Settings,
  BarChart3,
  CreditCard,
  HelpCircle,
  LogOut,
  ListTodo,
  Share2,
  Key,
  Megaphone,
  ArrowRight,
  Cpu,
  Smartphone,
  Users,
  Crown,
  Shield,
  Sliders,
  HandMetal,
  Bug,
  Brain,
  Globe,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const mainNavItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "نظرة عامة", href: "/dashboard" },
  { icon: Bot, label: "التوائم الرقمية", href: "/dashboard/twins" },
  { icon: ListTodo, label: "المهام", href: "/dashboard/tasks" },
  { icon: MessageSquare, label: "المحادثات", href: "/dashboard/conversations" },
  { icon: BarChart3, label: "الإحصائيات", href: "/dashboard/analytics" },
];

const integrationNavItems: SidebarItem[] = [
  { icon: Share2, label: "وسائل التواصل", href: "/dashboard/social" },
  { icon: Key, label: "مفاتيح API", href: "/dashboard/api-keys" },
  { icon: Megaphone, label: "الحملات التسويقية", href: "/dashboard/campaigns" },
];

const secondaryNavItems: SidebarItem[] = [
  { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
  { icon: CreditCard, label: "الاشتراك", href: "/dashboard/billing" },
  { icon: HelpCircle, label: "المساعدة", href: "/dashboard/help" },
];

const twinNavItems: SidebarItem[] = [
  { icon: Sliders, label: "الإعدادات", href: "/dashboard/twin-settings" },
  { icon: Bug, label: "التشخيص الذاتي", href: "/dashboard/twin-diagnosis" },
  { icon: Brain, label: "المهارات", href: "/dashboard/twin-skills" },
  { icon: Globe, label: "أدوات AI العالمية", href: "/dashboard/twin-ai-tools" },
  { icon: HandMetal, label: "لغة الإشارة", href: "/dashboard/twin-sign" },
  { icon: Cpu, label: "AI خارجي", href: "/dashboard/twin-ai" },
  { icon: Smartphone, label: "ربط الأجهزة", href: "/dashboard/twin-connect" },
  { icon: Users, label: "شبكة التوائم", href: "/dashboard/twin-network" },
  { icon: Clock, label: "مهام Offline", href: "/dashboard/twin-offline" },
  { icon: Crown, label: "الترقية", href: "/dashboard/twin-upgrade" },
  { icon: Shield, label: "API Tokens", href: "/dashboard/twin-api-tokens" },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedTwinId?: string | null;
  selectedTwinName?: string;
  onBackToTwins?: () => void;
}

const DashboardSidebar = ({ activeTab, onTabChange, selectedTwinId, selectedTwinName, onBackToTwins }: DashboardSidebarProps) => {
  const { signOut } = useAuth();

  const handleNavClick = (href: string) => {
    const tab = href.split("/").pop() || "dashboard";
    onTabChange(tab === "dashboard" ? "overview" : tab);
  };

  return (
    <motion.aside
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-sidebar-background border-l border-sidebar-border"
      dir="rtl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoIcon} alt="ماترِكسي" className="w-10 h-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ماترِكسي
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* قسم التوأم المحدد */}
        {selectedTwinId && selectedTwinName && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 mb-2">
              <button onClick={onBackToTwins} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 truncate">
                {selectedTwinName}
              </p>
            </div>
            {twinNavItems.map((item) => {
              const tabId = item.href.split("/").pop() || "twin-settings";
              const isActive = activeTab === tabId;
              return (
                <button
                  key={item.href}
                  onClick={() => onTabChange(tabId)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="my-3 border-t border-sidebar-border" />
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            القائمة الرئيسية
          </p>
          {mainNavItems.map((item) => {
            const tabId = item.href.split("/").pop() || "overview";
            const isActive = activeTab === (tabId === "dashboard" ? "overview" : tabId);
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="mr-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-sidebar-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            التكامل
          </p>
          {integrationNavItems.map((item) => {
            const tabId = item.href.split("/").pop() || "social";
            const isActive = activeTab === tabId;
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-sidebar-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            الإعدادات
          </p>
          {secondaryNavItems.map((item) => {
            const tabId = item.href.split("/").pop() || "settings";
            const isActive = activeTab === tabId;
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
