import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "matrxe_cookie_consent";

interface CookiePrefs {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    necessary: true,
    analytics: true,
    marketing: false,
    acceptedAt: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const updated = { ...prefs, analytics: true, marketing: true, acceptedAt: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShow(false);
  };

  const acceptSelected = () => {
    const updated = { ...prefs, acceptedAt: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShow(false);
  };

  const rejectAll = () => {
    const updated = { ...prefs, analytics: false, marketing: false, acceptedAt: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-background border border-border/50 rounded-xl shadow-2xl p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">إعدادات الخصوصية</h3>
                  <button onClick={rejectAll} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك. نحن ملتزمون بـ{" "}
                  <a href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</a> و{" "}
                  <a href="/terms" className="text-primary hover:underline">شروط الخدمة</a>.
                </p>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="space-y-3 pt-2 border-t">
                        <label className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <input type="checkbox" checked disabled className="accent-primary" />
                          <div>
                            <span className="font-medium text-sm">ضروري</span>
                            <p className="text-xs text-muted-foreground">مطلوب لتشغيل الموقع بشكل أساسي</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.analytics}
                            onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                            className="accent-primary"
                          />
                          <div>
                            <span className="font-medium text-sm">تحليلي</span>
                            <p className="text-xs text-muted-foreground">يساعدنا في تحسين الموقع (Google Analytics)</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.marketing}
                            onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                            className="accent-primary"
                          />
                          <div>
                            <span className="font-medium text-sm">تسويقي</span>
                            <p className="text-xs text-muted-foreground">للعروض والإعلانات المخصصة</p>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm" onClick={acceptAll}>قبول الكل</Button>
                  {showDetails && (
                    <Button size="sm" variant="outline" onClick={acceptSelected}>قبول المحدد</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={rejectAll}>رفض الكل</Button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-muted-foreground hover:text-foreground underline mr-auto"
                  >
                    {showDetails ? "إخفاء التفاصيل" : "تخصيص الإعدادات"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
