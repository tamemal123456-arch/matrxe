import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Globe, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SocialConnection {
  id: string;
  platform: string;
  account_name: string;
  account_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
}

const PLATFORMS = [
  { id: "twitter", label: "Twitter / X", icon: "𝕏", color: "hover:border-blue-400" },
  { id: "instagram", label: "Instagram", icon: "📷", color: "hover:border-pink-400" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "hover:border-blue-600" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "hover:border-blue-500" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "hover:border-red-500" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "hover:border-purple-400" },
  { id: "telegram", label: "Telegram", icon: "✈️", color: "hover:border-blue-300" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "hover:border-green-400" },
  { id: "snapchat", label: "Snapchat", icon: "👻", color: "hover:border-yellow-400" },
  { id: "discord", label: "Discord", icon: "🎮", color: "hover:border-indigo-400" },
];

const SocialMediaIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountUrl, setNewAccountUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchConnections();
  }, [user]);

  const fetchConnections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user?.id)
      .order("platform", { ascending: true });

    if (!error && data) setConnections(data);
    setLoading(false);
  };

  const addConnection = async () => {
    if (!newPlatform || !newAccountName) {
      toast({ title: "خطأ", description: "يرجى اختيار المنصة وإدخال اسم الحساب", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("social_connections").insert({
      user_id: user?.id,
      platform: newPlatform,
      account_name: newAccountName,
      account_url: newAccountUrl || null,
    });

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إضافة الاتصال بنجاح" });
      setShowAddForm(false);
      setNewPlatform("");
      setNewAccountName("");
      setNewAccountUrl("");
      fetchConnections();
    }
    setSaving(false);
  };

  const deleteConnection = async (id: string) => {
    const { error } = await supabase.from("social_connections").delete().eq("id", id);
    if (!error) {
      setConnections(prev => prev.filter(c => c.id !== id));
      toast({ title: "تم الحذف", description: "تم حذف الاتصال" });
    }
  };

  const toggleActive = async (connection: SocialConnection) => {
    const { error } = await supabase
      .from("social_connections")
      .update({ is_active: !connection.is_active })
      .eq("id", connection.id);

    if (!error) fetchConnections();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">التكامل مع وسائل التواصل</h2>
          <p className="text-sm text-muted-foreground">اربط حساباتك ليتمكن توأمك الرقمي من النشر والتفاعل نيابة عنك</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة حساب
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-2xl p-6 border border-primary/30 space-y-4"
        >
          <div className="grid grid-cols-5 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setNewPlatform(p.id)}
                className={`p-3 rounded-xl text-center transition-all border ${
                  newPlatform === p.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border/30 hover:border-border/60"
                }`}
              >
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="text-xs">{p.label}</div>
              </button>
            ))}
          </div>

          <Input
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="اسم الحساب (مثال: @username)"
          />
          <Input
            value={newAccountUrl}
            onChange={(e) => setNewAccountUrl(e.target.value)}
            placeholder="رابط الحساب (اختياري)"
            dir="ltr"
          />

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>إلغاء</Button>
            <Button onClick={addConnection} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Connections List */}
      <div className="grid gap-4">
        {connections.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد حسابات مرتبطة بعد</p>
            <p className="text-xs text-muted-foreground/50 mt-1">أضف حساباتك ليتمكن توأمك الرقمي من النشر والترويج</p>
          </div>
        ) : (
          connections.map((conn) => {
            const platform = PLATFORMS.find(p => p.id === conn.platform);
            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  conn.is_active ? "border-primary/30" : "border-border/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-muted">
                      {platform?.icon || "🌐"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{platform?.label || conn.platform}</p>
                      <p className="text-sm text-muted-foreground">{conn.account_name}</p>
                      {conn.account_url && (
                        <a href={conn.account_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> {conn.account_url}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={conn.is_active ? "default" : "outline"}
                      onClick={() => toggleActive(conn)}
                    >
                      {conn.is_active ? "نشط" : "متوقف"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteConnection(conn.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SocialMediaIntegration;
