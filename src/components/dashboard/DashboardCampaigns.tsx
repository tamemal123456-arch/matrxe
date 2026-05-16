import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  campaign_type: string;
  platform: string | null;
  status: string;
  target_url: string | null;
  content: string | null;
  result_summary: string | null;
  created_at: string;
}

const CAMPAIGN_ICONS: Record<string, string> = {
  seo: "🔍",
  social_media: "📱",
  ai_directories: "🤖",
  search_engines: "🌐",
  content_marketing: "📝",
};

const CAMPAIGN_LABELS: Record<string, string> = {
  seo: "تحسين محركات البحث",
  social_media: "تواصل اجتماعي",
  ai_directories: "أدلة الذكاء الاصطناعي",
  search_engines: "محركات البحث",
  content_marketing: "تسويق المحتوى",
};

const DashboardCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("twin_marketing_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) setCampaigns(data);
    setLoading(false);
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
          <h2 className="text-xl font-bold text-foreground">الحملات التسويقية</h2>
          <p className="text-sm text-muted-foreground">حملات الترويج الذاتي والتسويق الرقمي المُدارة بواسطة توأمك الرقمي</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد حملات تسويقية بعد</p>
          <p className="text-xs text-muted-foreground/50 mt-1">اسأل توأمك الرقمي عن بدء حملة تسويقية</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((camp) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 border border-border/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-2xl">{CAMPAIGN_ICONS[camp.campaign_type] || "📌"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {CAMPAIGN_LABELS[camp.campaign_type] || camp.campaign_type}
                      </p>
                      <Badge variant={camp.status === "active" ? "default" : camp.status === "completed" ? "secondary" : "outline"}>
                        {camp.status === "active" ? "نشط" : camp.status === "completed" ? "مكتمل" : "مسودة"}
                      </Badge>
                    </div>
                    {camp.target_url && (
                      <a href={camp.target_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {camp.target_url}
                      </a>
                    )}
                    {camp.result_summary && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{camp.result_summary}</p>
                    )}
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {new Date(camp.created_at).toLocaleDateString("ar")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCampaigns;
