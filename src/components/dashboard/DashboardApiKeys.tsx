import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Key, Eye, EyeOff, Loader2, Shield, Zap, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  service_name: string;
  provider: string;
  api_key_encrypted: string;
  tier: "free" | "paid";
  base_url: string | null;
  is_active: boolean;
  usage_count: number;
  monthly_limit: number | null;
  last_used_at: string | null;
  created_at: string;
}

const PROVIDERS = [
  { value: "openrouter", label: "OpenRouter", free: true, paid: true },
  { value: "google", label: "Google AI Studio", free: true, paid: true },
  { value: "openai", label: "OpenAI", free: false, paid: true },
  { value: "deepseek", label: "DeepSeek", free: true, paid: true },
  { value: "kimi", label: "Kimi (Moonshot)", free: true, paid: true },
  { value: "groq", label: "Groq", free: true, paid: false },
  { value: "elevenlabs", label: "ElevenLabs", free: false, paid: true },
  { value: "anthropic", label: "Anthropic", free: false, paid: true },
];

const SERVICE_OPTIONS = ["chat", "image", "tts", "embedding"];

const DashboardApiKeys = () => {
  const { user } = useAuth();
  const { canAccess } = useSubscription();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [serviceName, setServiceName] = useState("chat");
  const [provider, setProvider] = useState("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (!error && data) setKeys(data);
    setLoading(false);
  };

  const addKey = async () => {
    if (!apiKey) {
      toast({ title: "خطأ", description: "يرجى إدخال مفتاح API", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_api_keys").insert({
      user_id: user?.id,
      service_name: serviceName,
      provider,
      api_key_encrypted: apiKey,
      tier,
      base_url: baseUrl || null,
      monthly_limit: monthlyLimit ? parseInt(monthlyLimit) : null,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إضافة المفتاح بنجاح" });
      setShowAdd(false);
      setApiKey("");
      setBaseUrl("");
      setMonthlyLimit("");
      fetchKeys();
    }
    setSaving(false);
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("user_api_keys").delete().eq("id", id);
    if (!error) {
      setKeys(prev => prev.filter(k => k.id !== id));
      toast({ title: "تم الحذف", description: "تم حذف المفتاح" });
    } else {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const getUsagePercent = (k: ApiKey) => {
    if (!k.monthly_limit || k.monthly_limit <= 0) return null;
    return Math.min(100, Math.round((k.usage_count / k.monthly_limit) * 100));
  };

  const getProviderLabel = (val: string) => PROVIDERS.find(p => p.value === val)?.label || val;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const freeKeys = keys.filter(k => k.tier === "free");
  const paidKeys = keys.filter(k => k.tier === "paid");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">مفاتيح API</h1>
        <p className="text-muted-foreground">إدارة مفاتيح مزودي الذكاء الاصطناعي</p>
        {!canAccess("api_access") && (
          <p className="text-sm text-destructive mt-2">ميزة مفاتيح API متاحة فقط لخطة المؤسسات. قم بترقية خطتك للوصول.</p>
        )}
      </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مفتاح
        </Button>
      </div>

      {keys.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">مجانية</span>
            </div>
            <p className="text-2xl font-bold">{freeKeys.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">مدفوعة</span>
            </div>
            <p className="text-2xl font-bold">{paidKeys.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">إجمالي الطلبات</span>
            </div>
            <p className="text-2xl font-bold">{keys.reduce((a, k) => a + k.usage_count, 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="glass-card rounded-2xl p-6 border border-primary/30 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الموفر</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">تصنيف الخدمة</label>
              <Select value={serviceName} onValueChange={setServiceName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المستوى</label>
              <Select value={tier} onValueChange={(v) => setTier(v as "free" | "paid")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني (يُستخدم أولاً)</SelectItem>
                  <SelectItem value="paid">مدفوع (احتياطي)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الحد الشهري (اختياري)</label>
              <Input value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="مثال: 10000" type="number" dir="ltr" />
            </div>
          </div>
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            placeholder="مفتاح API" type="password" dir="ltr" />
          <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="الرابط الأساسي (اختياري، سيتم استخدام الافتراضي إن ترك فارغاً)"
            dir="ltr" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
            <Button onClick={addKey} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-3">
        {keys.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Key className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد مفاتيح API بعد</p>
            <p className="text-xs text-muted-foreground/50 mt-1">أضف مفتاحاً مجانياً للبدء، النظام سيستخدم المفاتيح المجانية أولاً ثم المدفوعة تلقائياً</p>
          </div>
        ) : (
          keys.map((k) => {
            const usagePct = getUsagePercent(k);
            return (
              <motion.div key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${k.tier === "free" ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                      <Key className={`w-5 h-5 ${k.tier === "free" ? "text-green-400" : "text-amber-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{getProviderLabel(k.provider)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${k.tier === "free" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {k.tier === "free" ? "مجاني" : "مدفوع"}
                        </span>
                        <span className="text-xs text-muted-foreground">#{k.service_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span dir="ltr">{k.api_key_encrypted.slice(0, 8)}•••</span>
                        {k.base_url && <span dir="ltr" className="truncate max-w-[200px]">{k.base_url}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {usagePct !== null && (
                      <div className="hidden sm:block text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RefreshCw className="w-3 h-3" />
                          <span>{k.usage_count.toLocaleString()} / {k.monthly_limit?.toLocaleString()}</span>
                        </div>
                        <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
                          <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${usagePct}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggleVisibility(k.id)}>
                        {visibleKeys.has(k.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteKey(k.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {k.last_used_at && (
                  <p className="text-xs text-muted-foreground/50 mt-2">
                    آخر استخدام: {new Date(k.last_used_at).toLocaleString("ar")}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardApiKeys;
