// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardTwins from "@/components/dashboard/DashboardTwins";
import DashboardConversations from "@/components/dashboard/DashboardConversations";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardSettings from "@/components/dashboard/DashboardSettings";
import DashboardBilling from "@/components/dashboard/DashboardBilling";
import DashboardHelp from "@/components/dashboard/DashboardHelp";
import TwinTasksManager from "@/components/dashboard/TwinTasksManager";
import SocialMediaIntegration from "@/components/dashboard/SocialMediaIntegration";
import DashboardApiKeys from "@/components/dashboard/DashboardApiKeys";
import DashboardCampaigns from "@/components/dashboard/DashboardCampaigns";
import TwinAdvancedSettings from "@/components/twin/TwinAdvancedSettings";
import TwinExternalAI from "@/components/twin/TwinExternalAI";
import TwinConnectDevices from "@/components/twin/TwinConnectDevices";
import TwinNetworking from "@/components/twin/TwinNetworking";
import TwinUpgrade from "@/components/twin/TwinUpgrade";
import TwinApiToken from "@/components/twin/TwinApiToken";
import TwinSignLanguage from "@/components/twin/TwinSignLanguage";
import TwinDiagnosis from "@/components/twin/TwinDiagnosis";
import TwinSkills from "@/components/twin/TwinSkills";
import TwinAITools from "@/components/twin/TwinAITools";
import TwinOfflineTasks from "@/components/twin/TwinOfflineTasks";

interface DigitalTwin {
  id: string;
  name: string;
  personality: string | null;
  status: string;
  voice_samples_count: number;
  avatar_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentPlan } = useSubscription();
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [selectedTwinName, setSelectedTwinName] = useState("");
  const [selectedTwinData, setSelectedTwinData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [twinsResult, conversationsResult] = await Promise.all([
        supabase.from("digital_twins").select("*").eq("user_id", user?.id).order("created_at", { ascending: false }),
        supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", user?.id),
      ]);

      if (twinsResult.error) throw twinsResult.error;
      setTwins(twinsResult.data || []);
      setConversationsCount(conversationsResult.count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fetchTwinData = useCallback(async (twinId: string) => {
    const { data } = await supabase
      .from("digital_twins")
      .select("*")
      .eq("id", twinId)
      .single();
    if (data) setSelectedTwinData(data);
  }, []);

  const handleSelectTwin = (twinId: string, twinName: string) => {
    setSelectedTwinId(twinId);
    setSelectedTwinName(twinName);
    setActiveTab("twin-settings");
    fetchTwinData(twinId);
  };

  const handleBackToTwins = () => {
    setSelectedTwinId(null);
    setSelectedTwinName("");
    setSelectedTwinData(null);
    setActiveTab("twins");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardOverview
            twinsCount={twins.length}
            conversationsCount={conversationsCount}
            onTabChange={setActiveTab}
          />
        );
      case "twins":
        return <DashboardTwins twins={twins} onTwinsChange={setTwins} onSelectTwin={handleSelectTwin} />;
      case "tasks":
        return (
          <TwinTasksManager 
            twins={twins.map(t => ({ id: t.id, name: t.name }))} 
            userPlan={currentPlan} 
          />
        );
      case "conversations":
        return <DashboardConversations />;
      case "analytics":
        return (
          <DashboardAnalytics
            twinsCount={twins.length}
            conversationsCount={conversationsCount}
          />
        );
      case "twin-settings":
        return selectedTwinData ? (
          <TwinAdvancedSettings twin={selectedTwinData} onUpdate={() => fetchTwinData(selectedTwinId!)} />
        ) : null;
      case "twin-diagnosis":
        return selectedTwinId ? <TwinDiagnosis twinId={selectedTwinId} /> : <TwinDiagnosis twinId="" />;
      case "twin-skills":
        return selectedTwinId ? <TwinSkills twinId={selectedTwinId} /> : null;
      case "twin-ai-tools":
        return selectedTwinId ? <TwinAITools twinId={selectedTwinId} /> : null;
      case "twin-sign":
        return selectedTwinId ? <TwinSignLanguage twinId={selectedTwinId} /> : null;
      case "twin-ai":
        return selectedTwinId ? <TwinExternalAI twinId={selectedTwinId} /> : null;
      case "twin-connect":
        return selectedTwinId ? <TwinConnectDevices twinId={selectedTwinId} twinName={selectedTwinName} /> : null;
      case "twin-network":
        return selectedTwinId ? <TwinNetworking twinId={selectedTwinId} /> : null;
      case "twin-offline":
        return selectedTwinId ? <TwinOfflineTasks twinId={selectedTwinId} /> : null;
      case "twin-upgrade":
        return selectedTwinId ? <TwinUpgrade twinId={selectedTwinId} twinName={selectedTwinName} /> : null;
      case "twin-api-tokens":
        return selectedTwinId ? <TwinApiToken twinId={selectedTwinId} /> : null;
      case "settings":
        return <DashboardSettings />;
      case "social":
        return <SocialMediaIntegration />;
      case "api-keys":
        return <DashboardApiKeys />;
      case "campaigns":
        return <DashboardCampaigns />;
      case "billing":
        return <DashboardBilling />;
      case "help":
        return <DashboardHelp />;
      default:
        return (
          <DashboardOverview
            twinsCount={twins.length}
            conversationsCount={conversationsCount}
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTwinId={selectedTwinId}
        selectedTwinName={selectedTwinName}
        onBackToTwins={handleBackToTwins}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-4 lg:p-8 relative z-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
