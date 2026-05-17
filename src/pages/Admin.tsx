// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TeamManagement } from "@/components/team/TeamManagement";
import { DataExport } from "@/components/team/DataExport";
import { Shield, Users, Bot, MessageSquare, CreditCard, ArrowRight, Trash2, Key, Download, UsersRound } from "lucide-react";
import AdminApiKeys from "@/components/admin/AdminApiKeys";

type Profile = {
  user_id: string;
  full_name: string | null;
  created_at: string;
};

type Twin = {
  id: string;
  name: string;
  user_id: string;
  status: string | null;
  created_at: string;
};

type Subscription = {
  user_id: string;
  plan_id: string;
  status: string | null;
};

type RoleRow = {
  user_id: string;
  role: string;
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [twins, setTwins] = useState<Twin[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    (async () => {
      const [p, t, s, r] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at").order("created_at", { ascending: false }),
        supabase.from("digital_twins").select("id, name, user_id, status, created_at").order("created_at", { ascending: false }),
        supabase.from("user_subscriptions").select("user_id, plan_id, status"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      setProfiles((p.data as Profile[]) ?? []);
      setTwins((t.data as Twin[]) ?? []);
      setSubs((s.data as Subscription[]) ?? []);
      setRoles((r.data as RoleRow[]) ?? []);
      setLoading(false);
    })();
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      setRoles((prev) => [...prev, { user_id: userId, role: "admin" }]);
      toast({ title: "تم", description: "تم منح صلاحية المسؤول" });
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      setRoles((prev) => prev.filter((r) => !(r.user_id === userId && r.role === "admin")));
      toast({ title: "تم", description: "تم سحب صلاحية المسؤول" });
    }
  };

  const deleteTwin = async (id: string) => {
    if (!confirm("حذف هذا التوأم نهائياً؟")) return;
    const { error } = await supabase.from("digital_twins").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    setTwins((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "تم الحذف" });
  };

  const updatePlan = async (userId: string, plan: string) => {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ plan_id: plan, status: "active" })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    setSubs((prev) => prev.map((s) => (s.user_id === userId ? { ...s, plan_id: plan, status: "active" } : s)));
    toast({ title: "تم تحديث الخطة" });
  };

  if (authLoading || roleLoading || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-border/50">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">غير مصرح</h1>
          <p className="text-muted-foreground mb-6">هذه الصفحة مخصصة للمسؤولين فقط.</p>
          <Link to="/dashboard">
            <Button>العودة للوحة التحكم</Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminUserIds = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));
  const subByUser = new Map(subs.map((s) => [s.user_id, s]));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass-card border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">لوحة الإدارة</h1>
            <Badge variant="secondary" className="font-tech">ADMIN</Badge>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" />
              لوحة التحكم
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={Users} label="المستخدمون" value={profiles.length} />
          <StatCard icon={Bot} label="التوائم الرقمية" value={twins.length} />
          <StatCard icon={MessageSquare} label="المسؤولون" value={adminUserIds.size} />
          <StatCard icon={CreditCard} label="الاشتراكات" value={subs.length} />
        </motion.div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="twins">التوائم</TabsTrigger>
            <TabsTrigger value="subs">الاشتراكات</TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" /> المفاتيح
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <UsersRound className="w-4 h-4" /> الفرق
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" /> التصدير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">معرف المستخدم</TableHead>
                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => {
                    const isUserAdmin = adminUserIds.has(p.user_id);
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                        <TableCell className="font-mono-tech text-xs text-muted-foreground">
                          {p.user_id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("ar")}
                        </TableCell>
                        <TableCell>
                          {isUserAdmin ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isUserAdmin ? "outline" : "default"}
                            onClick={() => toggleAdmin(p.user_id, !isUserAdmin)}
                            disabled={p.user_id === user?.id}
                          >
                            {isUserAdmin ? "سحب الصلاحية" : "ترقية لمسؤول"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="twins">
            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">المالك</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {twins.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="font-mono-tech text-xs text-muted-foreground">
                        {t.user_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.status || "draft"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString("ar")}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteTwin(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="api-keys">
            <AdminApiKeys />
          </TabsContent>

          <TabsContent value="teams">
            <div className="glass-card rounded-xl border border-border/50 p-4">
              <TeamManagement />
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="glass-card rounded-xl border border-border/50 p-4">
              <DataExport />
            </div>
          </TabsContent>

          <TabsContent value="subs">
            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الخطة الحالية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تغيير الخطة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => {
                    const sub = subByUser.get(p.user_id);
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell className="font-medium">{p.full_name || p.user_id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sub?.plan_id || "free"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sub?.status || "—"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {(["free", "pro", "enterprise"] as const).map((plan) => (
                            <Button
                              key={plan}
                              size="sm"
                              variant={sub?.plan_id === plan ? "default" : "outline"}
                              onClick={() => updatePlan(p.user_id, plan)}
                            >
                              {plan}
                            </Button>
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="glass-card rounded-xl p-4 border border-border/50">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-tech text-2xl font-bold">{value}</span>
    </div>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default Admin;
