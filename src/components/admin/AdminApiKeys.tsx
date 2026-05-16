import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Loader2, Search, Shield, Zap, Ban, RefreshCw, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminKeyRow {
  id: string;
  user_id: string;
  user_email: string;
  service_name: string;
  provider: string;
  tier: "free" | "paid";
  is_active: boolean;
  usage_count: number;
  monthly_limit: number | null;
  last_used_at: string | null;
  created_at: string;
}

const AdminApiKeys = () => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<AdminKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const fetchAllKeys = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { setLoading(false); return; }

    const { data, error } = await supabase.rpc("get_all_api_keys", {
      admin_uid: (await supabase.auth.getUser()).data.user?.id,
    });
    if (!error && data) setKeys(data as AdminKeyRow[]);
    else if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchAllKeys(); }, []);

  const resetUsage = async (keyId: string) => {
    const { error } = await supabase.rpc("reset_key_usage", {
      admin_uid: (await supabase.auth.getUser()).data.user?.id,
      key_id: keyId,
    });
    if (!error) {
      toast({ title: "تم", description: "تم إعادة تعيين عداد الاستخدام" });
      fetchAllKeys();
    } else toast({ title: "خطأ", description: error.message, variant: "destructive" });
  };

  const deleteKey = async (keyId: string) => {
    const { error } = await supabase.from("user_api_keys").delete().eq("id", keyId);
    if (!error) {
      toast({ title: "تم", description: "تم حذف المفتاح" });
      fetchAllKeys();
    } else toast({ title: "خطأ", description: error.message, variant: "destructive" });
  };

  const toggleKeyActive = async (keyId: string, current: boolean) => {
    const { error } = await supabase.from("user_api_keys").update({ is_active: !current }).eq("id", keyId);
    if (!error) { toast({ title: "تم", description: "تم تغيير حالة المفتاح" }); fetchAllKeys(); }
  };

  const filtered = keys.filter(k => {
    if (filterTier !== "all" && k.tier !== filterTier) return false;
    if (search) {
      const q = search.toLowerCase();
      return k.user_email?.toLowerCase().includes(q) || k.provider.includes(q) || k.service_name.includes(q);
    }
    return true;
  });

  const stats = {
    total: keys.length,
    free: keys.filter(k => k.tier === "free").length,
    paid: keys.filter(k => k.tier === "paid").length,
    usage: keys.reduce((a, k) => a + k.usage_count, 0),
    exhausted: keys.filter(k => k.monthly_limit && k.monthly_limit > 0 && k.usage_count >= k.monthly_limit).length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold">إدارة مفاتيح API</h2>
          <p className="text-sm text-muted-foreground">إشراف كامل على جميع مفاتيح المستخدمين</p>
        </div>
        <Button onClick={fetchAllKeys} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBadge icon={Key} label="المجموع" value={stats.total} color="text-blue-400" />
        <StatBadge icon={Zap} label="مجاني" value={stats.free} color="text-green-400" />
        <StatBadge icon={Shield} label="مدفوع" value={stats.paid} color="text-amber-400" />
        <StatBadge icon={BarChartIcon} label="الاستخدام" value={stats.usage.toLocaleString()} color="text-purple-400" />
        <StatBadge icon={Ban} label="مستنزف" value={stats.exhausted} color="text-red-400" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="paid">مدفوع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الموفر</TableHead>
              <TableHead className="text-right">الخدمة</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">الاستخدام</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">لا توجد مفاتيح</TableCell></TableRow>
            ) : filtered.map((k) => {
              const usagePct = k.monthly_limit && k.monthly_limit > 0 ? Math.min(100, Math.round((k.usage_count / k.monthly_limit) * 100)) : null;
              return (
                <TableRow key={k.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs">{k.user_email || k.user_id.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-medium">{k.provider}</span></TableCell>
                  <TableCell><Badge variant="outline">{k.service_name}</Badge></TableCell>
                  <TableCell>
                    <Badge className={k.tier === "free" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}>
                      {k.tier === "free" ? "مجاني" : "مدفوع"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-tech">{k.usage_count.toLocaleString()}</span>
                      {usagePct !== null && (
                        <div className="w-16 h-1.5 bg-muted rounded-full">
                          <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${usagePct}%` }} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${k.is_active ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs">{k.is_active ? "نشط" : "معطل"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => resetUsage(k.id)} title="إعادة عداد">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleKeyActive(k.id, k.is_active)} title={k.is_active ? "تعطيل" : "تفعيل"}>
                        {k.is_active ? <Ban className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteKey(k.id)} title="حذف" className="text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <div className="glass-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
    <Icon className={`w-5 h-5 ${color}`} />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

export default AdminApiKeys;
