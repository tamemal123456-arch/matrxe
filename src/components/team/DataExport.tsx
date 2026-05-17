import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, MessageSquare, Bot, Key, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const exportTypes = [
  { id: "full", label: "جميع البيانات", icon: FileJson, desc: "الملفات الشخصية، المحادثات، التوائم، المفاتيح" },
  { id: "messages", label: "المحادثات فقط", icon: MessageSquare, desc: "جميع المحادثات والرسائل" },
  { id: "twins", label: "التوائم فقط", icon: Bot, desc: "بيانات التوائم الرقمية" },
  { id: "api_keys", label: "المفاتيح فقط", icon: Key, desc: "أسماء المزودين بدون المفاتيح نفسها" },
];

export function DataExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ exportType: type }),
      });
      const data = await res.json();
      if (data.url) {
        setExported(data.url);
        toast({ title: "تم التصدير", description: "ملف البيانات جاهز للتحميل" });
      }
    } catch {
      toast({ title: "خطأ", description: "فشل تصدير البيانات", variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">تصدير البيانات</h1>
        <p className="text-muted-foreground">صدر جميع بياناتك بصيغة JSON (متوافق مع GDPR)</p>
      </div>

      {exported && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-accent/30 bg-accent/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent" />
            <span className="text-foreground">الملف جاهز للتحميل</span>
          </div>
          <Button variant="outline" onClick={() => window.open(exported, "_blank")} className="gap-2">
            <Download className="w-4 h-4" /> تحميل
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportTypes.map((et) => (
          <motion.button key={et.id} onClick={() => handleExport(et.id)} disabled={loading !== null}
            className="glass-card rounded-xl p-6 border border-border/50 text-right hover:border-primary/50 transition-all disabled:opacity-50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                {loading === et.id ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <et.icon className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{et.label}</h3>
                <p className="text-sm text-muted-foreground">{et.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
