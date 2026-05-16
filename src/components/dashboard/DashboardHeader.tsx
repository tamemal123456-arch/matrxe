import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Bot,
  MessageSquare,
  BarChart3,
  CreditCard,
  HelpCircle,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mobileNavItems = [
  { icon: LayoutDashboard, label: "نظرة عامة", tab: "overview" },
  { icon: Bot, label: "التوائم الرقمية", tab: "twins" },
  { icon: ListTodo, label: "المهام", tab: "tasks" },
  { icon: MessageSquare, label: "المحادثات", tab: "conversations" },
  { icon: BarChart3, label: "الإحصائيات", tab: "analytics" },
  { icon: Settings, label: "الإعدادات", tab: "settings" },
  { icon: CreditCard, label: "الاشتراك", tab: "billing" },
  { icon: HelpCircle, label: "المساعدة", tab: "help" },
];

const DashboardHeader = ({ activeTab, onTabChange }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50" dir="rtl">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-sidebar-background p-0">
              <div className="p-6 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-3">
                  <img src={logoIcon} alt="ماترِكسي" className="w-10 h-10" />
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ماترِكسي
                  </span>
                </Link>
              </div>
              <nav className="p-4 space-y-1">
                {mobileNavItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onTabChange(item.tab);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                      activeTab === item.tab
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-sidebar-border mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <img src={logoIcon} alt="ماترِكسي" className="w-8 h-8" />
        </Link>

        {/* Search (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              className="pr-10 bg-muted/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                  {user?.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email?.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onTabChange("settings")}>
                <Settings className="w-4 h-4 ml-2" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange("billing")}>
                <CreditCard className="w-4 h-4 ml-2" />
                الاشتراك
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="text-primary focus:text-primary">
                    <Settings className="w-4 h-4 ml-2" />
                    لوحة الإدارة
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
