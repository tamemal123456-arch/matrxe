import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, Info, CreditCard, MessageSquare, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, Notification } from "@/hooks/useNotifications";

const iconMap: Record<string, React.ElementType> = {
  subscription: CreditCard, system: Info, message: MessageSquare, twin: Info, team: Users, billing: AlertTriangle,
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-xl border border-border/50 shadow-xl z-50"
          >
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-sm">الإشعارات</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> تحديد الكل كمقروء
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">لا توجد إشعارات</div>
            ) : (
              notifications.slice(0, 20).map((n: Notification) => {
                const Icon = iconMap[n.type] || Info;
                return (
                  <button key={n.id} onClick={() => markAsRead(n.id)}
                    className={`w-full flex items-start gap-3 p-3 text-right hover:bg-muted/50 transition-colors ${n.is_read ? "" : "bg-primary/5"}`}
                  >
                    <Icon className={`w-4 h-4 mt-1 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
