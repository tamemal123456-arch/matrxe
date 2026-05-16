import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Key, Copy, Check, RefreshCw, Trash2, Plus,
  Eye, EyeOff, Shield, Clock, Activity, Loader2,
  AlertTriangle, X, Zap, Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinApiTokenProps {
  twinId: string;
}

interface Token {
  id: string;
  name: string;
  token_preview: string;
  permissions: string[];
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

const PERMISSION_OPTIONS = [
  { value: "chat", label: "محادثة", desc: "إرسال واستقبال الرسائل" },
  { value: "read_memory", label: "قراءة الذاكرة", desc: "الوصول إلى ذاكرة التوأم" },
  { value: "write_memory", label: "كتابة الذاكرة", desc: "تعديل ذاكرة التوأم" },
  { value: "voice", label: "صوت", desc: "استخدام خدمات الصوت" },
  { value: "video", label: "فيديو", desc: "استخدام الفيديو الناطق" },
  { value: "admin", label: "إدارة", desc: "التحكم الكامل بالتوأم" },
];

const TwinApiToken = ({ twinId }: TwinApiTokenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["chat"]);
  const [expiresIn, setExpiresIn] = useState("never");
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchTokens();
  }, [user, twinId]);

  const fetchTokens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("twin_api_tokens")
      .select("*")
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (data) setTokens(data);
    setLoading(false);
  };

  const generateTokenString = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const randomPart = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `mx_${twinId.substring(0, 8)}_${randomPart}`;
  };

  const handleCreate = async () => {
    if (!newTokenName.trim()) {
      toast({ title: "خطأ", description: "اسم التوكن مطلوب", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const tokenString = generateTokenString();
      const expiresAt = expiresIn === "never" ? null : new Date(Date.now() + parseInt(expiresIn) * 86400000).toISOString();

      const { error } = await supabase.from("twin_api_tokens").insert({
        twin_id: twinId,
        user_id: user?.id,
        name: newTokenName,
        token_hash: tokenString,
        token_preview: tokenString.substring(0, 12) + "...",
        permissions,
        expires_at: expiresAt,
        is_active: true,
      });

      if (error) throw error;

      setCreatedToken(tokenString);
      setNewTokenName("");
      setPermissions(["chat"]);
      setExpiresIn("never");
      fetchTokens();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("twin_api_tokens").delete().eq("id", deleteId);
    if (!error) {
      setTokens(prev => prev.filter(t => t.id !== deleteId));
      toast({ title: "تم", description: "تم حذف التوكن" });
    }
    setDeleteId(null);
  };

  const togglePermission = (perm: string) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "تم", description: "تم نسخ التوكن" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "خطأ", description: "فشل النسخ", variant: "destructive" });
    }
  };

  const getExpiryStatus = (token: Token) => {
    if (!token.is_active) return { label: "معطل", variant: "destructive" as const };
    if (!token.expires_at) return { label: "دائم", variant: "default" as const };
    const expiry = new Date(token.expires_at);
    const now = new Date();
    const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return { label: "منتهي", variant: "destructive" as const };
    if (daysLeft < 7) return { label: `${daysLeft} يوم`, variant: "secondary" as const };
    return { label: `${daysLeft} يوم`, variant: "default" as const };
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Tokens</h2>
          <p className="text-muted-foreground">أنشئ ورموز وصول لتطبيقات وخدمات خارجية</p>
        </div>
        <Button onClick={() => setShowCreate(true)} variant="hero" disabled={showCreate}>
          <Plus className="w-4 h-4 ml-2" /> توكن جديد
        </Button>
      </div>

      {showCreate && (
        <Card className="glass-card rounded-2xl p-6 border-primary/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> توكن جديد
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">اسم التوكن</label>
              <Input value={newTokenName} onChange={e => setNewTokenName(e.target.value)} placeholder="مثال: تطوير, API, بوت..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">صلاحية</label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">لا تنتهي</SelectItem>
                  <SelectItem value="7">7 أيام</SelectItem>
                  <SelectItem value="30">30 يوماً</SelectItem>
                  <SelectItem value="90">90 يوماً</SelectItem>
                  <SelectItem value="365">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">الصلاحيات</label>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_OPTIONS.map(perm => (
                <Badge
                  key={perm.value}
                  variant={permissions.includes(perm.value) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => togglePermission(perm.value)}
                  title={perm.desc}
                >
                  {perm.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
              إنشاء التوكن
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>إلغاء</Button>
          </div>

          {createdToken && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">سيظهر هذا التوكن مرة واحدة فقط. احفظه في مكان آمن.</span>
              </div>
              <div className="flex gap-2">
                <Input value={createdToken} readOnly dir="ltr" className="font-mono text-xs bg-background" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdToken)}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" /> التوكنات الحالية
        </h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد توكنات بعد</p>
            <p className="text-sm">أنشئ أول توكن API لتطبيقاتك الخارجية</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map(token => {
              const expiryStatus = getExpiryStatus(token);
              return (
                <div key={token.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{token.name}</p>
                        <Badge variant={expiryStatus.variant} className="text-xs">{expiryStatus.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <code className="text-xs text-muted-foreground font-mono">{token.token_preview}</code>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {token.usage_count} استخدام
                        </span>
                        {token.last_used_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(token.last_used_at).toLocaleDateString("ar")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {token.permissions?.map(p => {
                          const opt = PERMISSION_OPTIONS.find(o => o.value === p);
                          return opt ? (
                            <Badge key={p} variant="outline" className="text-xs py-0">{opt.label}</Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleTokenVisibility(token.id)}>
                      {visibleTokens.has(token.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(token.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" /> كيفية استخدام API
        </h3>
        <div className="p-4 rounded-xl bg-muted/30">
          <pre className="text-sm font-mono text-muted-foreground overflow-x-auto">
{`curl -X POST https://api.matrxe.com/v1/chat \\
  -H "Authorization: Bearer mx_yourtoken" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "مرحباً", "twin_id": "${twinId}"}'`}
          </pre>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          قريباً: توثيق كامل لواجهة API مع أمثلة على جميع اللغات
        </p>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التوكن</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التوكن؟ أي تطبيق يستخدمه سيفقد الوصول فوراً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TwinApiToken;