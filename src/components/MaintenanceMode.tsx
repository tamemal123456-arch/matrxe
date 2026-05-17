import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, Mail } from "lucide-react";

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  estimatedEnd: string | null;
}

async function fetchMaintenanceConfig(): Promise<MaintenanceConfig> {
  try {
    const res = await fetch("/api/maintenance.json");
    if (!res.ok) return { enabled: false, message: "", estimatedEnd: null };
    return await res.json();
  } catch {
    return { enabled: false, message: "", estimatedEnd: null };
  }
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MaintenanceConfig>({ enabled: false, message: "", estimatedEnd: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceConfig().then((cfg) => {
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (config.enabled) {
    return <MaintenancePage message={config.message} estimatedEnd={config.estimatedEnd} />;
  }

  return <>{children}</>;
}

function MaintenancePage({ message, estimatedEnd }: { message: string; estimatedEnd: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">نعمل على تحسين المنصة</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {message || "نقوم حالياً بإجراء بعض التحديثات. سنعود قريباً!"}
        </p>
        {estimatedEnd && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <Clock className="w-4 h-4" />
            <span>العودة المتوقعة: {estimatedEnd}</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>للاستفسار: support@matrxe.com</span>
        </div>
      </motion.div>
    </div>
  );
}
