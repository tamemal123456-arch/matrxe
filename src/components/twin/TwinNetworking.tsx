import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Link2, Users, Search, UserPlus, UserCheck, Bot,
  MessageSquare, Globe, Lock, Unlock, Loader2, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwinNetworkingProps {
  twinId: string;
}

interface TwinConnection {
  id: string;
  connected_twin_id: string;
  status: string;
  permissions: string;
  twin_name?: string;
  twin_avatar?: string;
}

const TwinNetworking = ({ twinId }: TwinNetworkingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<TwinConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allowAutoConnect, setAllowAutoConnect] = useState(false);
  const [publicDiscovery, setPublicDiscovery] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchTwinSettings();
    }
  }, [user, twinId]);

  const fetchConnections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("twin_connections")
      .select("*")
      .or(`twin_id.eq.${twinId},connected_twin_id.eq.${twinId}`)
      .order("created_at", { ascending: false });
    if (data) {
      const enriched = await enrichWithTwinNames(data);
      setConnections(enriched);
    }
    setLoading(false);
  };

  const fetchTwinSettings = async () => {
    const { data } = await supabase
      .from("digital_twins")
      .select("public_discovery, allow_auto_connect")
      .eq("id", twinId)
      .single();
    if (data) {
      setPublicDiscovery(data.public_discovery || false);
      setAllowAutoConnect(data.allow_auto_connect || false);
    }
  };

  const enrichWithTwinNames = async (conns: TwinConnection[]) => {
    return Promise.all(conns.map(async conn => {
      const otherId = conn.twin_id === twinId ? conn.connected_twin_id : conn.twin_id;
      const { data } = await supabase
        .from("digital_twins")
        .select("name, avatar_url")
        .eq("id", otherId)
        .single();
      return { ...conn, twin_name: data?.name || "توأم غير معروف", twin_avatar: data?.avatar_url || undefined };
    }));
  };

  const searchTwins = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("digital_twins")
      .select("id, name, avatar_url, personality")
      .neq("id", twinId)
      .ilike("name", `%${query}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  };

  const connectToTwin = async (targetTwinId: string) => {
    const { error } = await supabase.from("twin_connections").insert({
      twin_id: twinId,
      connected_twin_id: targetTwinId,
      status: "pending",
      permissions: "chat",
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم إرسال طلب الاتصال" });
      setSearchResults([]);
      setSearchQuery("");
      fetchConnections();
    }
  };

  const removeConnection = async (connId: string) => {
    const { error } = await supabase.from("twin_connections").delete().eq("id", connId);
    if (!error) {
      setConnections(prev => prev.filter(c => c.id !== connId));
      toast({ title: "تم", description: "تم فصل التوأمين" });
    }
  };

  const updateSetting = async (field: string, value: boolean) => {
    const { error } = await supabase
      .from("digital_twins")
      .update({ [field]: value })
      .eq("id", twinId);
    if (!error) {
      if (field === "public_discovery") setPublicDiscovery(value);
      if (field === "allow_auto_connect") setAllowAutoConnect(value);
      toast({ title: "تم", description: "تم تحديث الإعدادات" });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">شبكة التوائم الرقمية</h2>
        <p className="text-muted-foreground">اربط توأمك الرقمي بتوائم أخرى على المنصة</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* بحث عن توائم */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> البحث عن توائم
            </h3>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => searchTwins(e.target.value)}
                placeholder="ابحث باسم التوأم..."
                className="pr-10"
              />
            </div>
            {searching && <p className="text-sm text-muted-foreground mt-2">جاري البحث...</p>}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map(twin => {
                  const alreadyConnected = connections.some(c =>
                    c.connected_twin_id === twin.id || c.twin_id === twin.id
                  );
                  return (
                    <div key={twin.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          {twin.avatar_url ? (
                            <img src={twin.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Bot className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{twin.name}</p>
                          <p className="text-xs text-muted-foreground">{twin.personality?.substring(0, 50) || "توأم رقمي"}</p>
                        </div>
                      </div>
                      <Button
                        variant={alreadyConnected ? "ghost" : "hero"}
                        size="sm"
                        disabled={alreadyConnected}
                        onClick={() => connectToTwin(twin.id)}
                      >
                        {alreadyConnected ? <><Check className="w-4 h-4 ml-1" /> متصل</> : <><UserPlus className="w-4 h-4 ml-1" /> اتصال</>}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* التوائم المتصلة */}
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> التوائم المتصلة
            </h3>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد اتصالات بعد</p>
                <p className="text-sm">ابحث عن توائم رقمية للتواصل معها</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{conn.twin_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={conn.status === "accepted" ? "default" : "outline"} className="text-xs">
                            {conn.status === "accepted" ? "متصل" : conn.status === "pending" ? "معلق" : "مرفوض"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">صلاحية: {conn.permissions}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {conn.status === "accepted" && (
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4 ml-1" /> محادثة
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeConnection(conn.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* الإعدادات */}
        <div className="space-y-6">
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> إعدادات الشبكة
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-foreground text-sm">ظهور عام</p>
                  <p className="text-xs text-muted-foreground">السماح للآخرين بالعثور على توأمك</p>
                </div>
                <Switch checked={publicDiscovery} onCheckedChange={v => updateSetting("public_discovery", v)} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-foreground text-sm">اتصال تلقائي</p>
                  <p className="text-xs text-muted-foreground">قبول طلبات الاتصال تلقائياً</p>
                </div>
                <Switch checked={allowAutoConnect} onCheckedChange={v => updateSetting("allow_auto_connect", v)} />
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> صلاحيات الاتصال
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between p-2">
                <span>المحادثات النصية</span>
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2">
                <span>المشاركات الصوتية</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center justify-between p-2">
                <span>مشاركة المعرفة</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center justify-between p-2">
                <span>التعلم المشترك</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TwinNetworking;