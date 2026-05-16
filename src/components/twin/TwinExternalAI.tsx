import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu, Globe, Check, X, Plug, Zap, RefreshCw,
  Brain, Cloud, Server, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinExternalAIProps {
  twinId: string;
}

const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    icon: Brain,
    color: "from-green-500/20 to-emerald-500/20",
    desc: "GPT-4o, GPT-4, GPT-3.5"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    icon: Cloud,
    color: "from-orange-500/20 to-amber-500/20",
    desc: "Claude 3 Opus, Sonnet, Haiku"
  },
  {
    id: "google",
    name: "Google AI",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
    icon: Brain,
    color: "from-blue-500/20 to-indigo-500/20",
    desc: "Gemini 2.5 Pro, Flash"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    icon: Cpu,
    color: "from-purple-500/20 to-violet-500/20",
    desc: "DeepSeek-V3, DeepSeek-R1"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: ["auto"],
    icon: Globe,
    color: "from-cyan-500/20 to-teal-500/20",
    desc: "200+ models unified API"
  },
  {
    id: "custom",
    name: "خادم مخصص",
    models: ["custom"],
    icon: Server,
    color: "from-gray-500/20 to-slate-500/20",
    desc: "API endpoint مخصص"
  },
];

const PROVIDER_KEYS_MAP: Record<string, string> = {
  openai: "user_api_keys",
  anthropic: "user_api_keys",
  google: "user_api_keys",
  deepseek: "user_api_keys",
  openrouter: "user_api_keys",
};

interface AIConnection {
  id: string;
  provider: string;
  model: string;
  is_active: boolean;
  custom_endpoint: string | null;
}

const TwinExternalAI = ({ twinId }: TwinExternalAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [userKeys, setUserKeys] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchUserKeys();
    }
  }, [user, twinId]);

  const fetchConnections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("twin_ai_connections")
      .select("*")
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (data) setConnections(data);
    setLoading(false);
  };

  const fetchUserKeys = async () => {
    const { data } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true);
    if (data) setUserKeys(data);
  };

  const handleConnect = async () => {
    if (!selectedProvider) return;
    setConnecting(true);
    try {
      const { error } = await supabase.from("twin_ai_connections").insert({
        twin_id: twinId,
        user_id: user?.id,
        provider: selectedProvider,
        model: selectedModel === "auto" ? `${selectedProvider}/auto` : selectedModel,
        is_active: true,
        custom_endpoint: selectedProvider === "custom" ? customEndpoint : null,
      });
      if (error) throw error;
      toast({ title: "تم", description: "تم ربط مزود AI بنجاح" });
      setSelectedProvider("openai");
      setSelectedModel("gpt-4o");
      setCustomEndpoint("");
      fetchConnections();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const toggleConnection = async (conn: AIConnection) => {
    const { error } = await supabase
      .from("twin_ai_connections")
      .update({ is_active: !conn.is_active })
      .eq("id", conn.id);
    if (!error) fetchConnections();
  };

  const removeConnection = async (id: string) => {
    const { error } = await supabase
      .from("twin_ai_connections")
      .delete()
      .eq("id", id);
    if (!error) {
      setConnections(prev => prev.filter(c => c.id !== id));
      toast({ title: "تم", description: "تم فصل مزود AI" });
    }
  };

  const provider = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const Icon = provider?.icon || Cpu;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">تكامل الذكاء الاصطناعي الخارجي</h2>
        <p className="text-muted-foreground">اربط توأمك الرقمي بمزودي AI خارجيين لتعزيز قدراته</p>
      </div>

      {/* إضافة اتصال جديد */}
      <Card className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Plug className="w-5 h-5 text-primary" /> إضافة مزود جديد
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {AI_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedProvider(p.id); setSelectedModel(p.models[0]); }}
              className={`p-4 rounded-xl border-2 transition-all text-right ${
                selectedProvider === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-2`}>
                <p.icon className="w-5 h-5" />
              </div>
              <p className="font-medium text-foreground text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">النموذج</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProvider === "custom" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">رابط API المخصص</label>
              <Input value={customEndpoint} onChange={e => setCustomEndpoint(e.target.value)} placeholder="https://your-server.com/v1/chat/completions" />
            </div>
          )}
          <div className="flex items-end">
            <Button onClick={handleConnect} disabled={connecting} className="w-full">
              {connecting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
              ربط المزود
            </Button>
          </div>
        </div>
      </Card>

      {/* الاتصالات الحالية */}
      <Card className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" /> المزودات المتصلة
        </h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا يوجد مزودات متصلة حالياً</p>
            <p className="text-sm">اختر مزوداً من الأعلى لربطه</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map(conn => {
              const prov = AI_PROVIDERS.find(p => p.id === conn.provider);
              const PIcon = prov?.icon || Cpu;
              const hasKey = userKeys.some(k => k.provider === conn.provider);
              return (
                <div key={conn.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${prov?.color || "from-gray-500/20 to-slate-500/20"} flex items-center justify-center`}>
                      <PIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{prov?.name || conn.provider}</p>
                      <p className="text-xs text-muted-foreground">{conn.model}</p>
                    </div>
                    {!hasKey && (
                      <Badge variant="outline" className="text-amber-500 border-amber-500">مطلوب مفتاح API</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={conn.is_active} onCheckedChange={() => toggleConnection(conn)} />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeConnection(conn.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TwinExternalAI;