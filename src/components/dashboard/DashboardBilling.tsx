import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Zap, Crown, Sparkles, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardBilling = () => {
  const { plan, subscription, currentPlan, isPaidPlan, createCheckout, openPortal, checkoutLoading, refetch } = useSubscription();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    await createCheckout(planId, interval);
    setLoadingPlan(null);
  };

  const plans = [
    {
      id: "free", name: "مجاني", nameEn: "Free",
      price: 0, period: "للأبد",
      description: "مثالي للتجربة",
      features: ["توأم رقمي واحد", "100 رسالة شهرياً", "نماذج صوتية أساسية", "دعم المجتمع"],
    },
    {
      id: "pro", name: "احترافي", nameEn: "Pro",
      price: interval === "monthly" ? 49 : 39, period: interval === "monthly" ? "شهرياً" : "سنوياً",
      description: "للاستخدام الشخصي والمهني",
      popular: true,
      features: ["5 توائم رقمية", "رسائل غير محدودة", "نماذج صوتية متقدمة", "فيديو ناطق", "أولوية الدعم", "تحليلات متقدمة"],
    },
    {
      id: "enterprise", name: "مؤسسات", nameEn: "Enterprise",
      price: interval === "monthly" ? 199 : 165, period: interval === "monthly" ? "شهرياً" : "سنوياً",
      description: "للفرق والشركات",
      features: ["توائم غير محدودة", "API كامل الوصول", "تخصيص كامل", "دعم مخصص 24/7", "SLA مضمون", "إدارة الفريق"],
    },
  ];

  const formatDate = (d: string | null) => {
    if (!d) return "غير محدد";
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">الاشتراك والفوترة</h1>
        <p className="text-muted-foreground">إدارة خطتك وطرق الدفع</p>
      </div>

      {!isPaidPlan && (
        <div className="flex items-center gap-2 mb-4">
          <Button variant={interval === "monthly" ? "default" : "outline"} size="sm" onClick={() => setInterval("monthly")}>شهري</Button>
          <Button variant={interval === "yearly" ? "default" : "outline"} size="sm" onClick={() => setInterval("yearly")}>
            سنوي <Badge variant="secondary" className="mr-1">وفر 20%</Badge>
          </Button>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{plan?.name_ar || "مجاني"}</h2>
                <Badge variant={currentPlan === "free" ? "secondary" : "default"}>
                  {currentPlan === "free" ? "الحالية" : "مشترك"}
                </Badge>
                {isPaidPlan && subscription?.stripe_subscription_status === "active" && (
                  <Badge variant="default" className="bg-accent/10 text-accent border-accent/30">نشط</Badge>
                )}
              </div>
              {currentPlan === "free" ? (
                <p className="text-muted-foreground">قم بالترقية لفتح الميزات المتقدمة</p>
              ) : (
                <p className="text-muted-foreground">تجديد في: {formatDate(subscription?.current_period_end || null)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isPaidPlan && (
              <Button variant="outline" className="gap-2" onClick={openPortal} disabled={checkoutLoading}>
                <CreditCard className="w-4 h-4" />
                إدارة الدفع
              </Button>
            )}
            <Button variant="outline" className="gap-2" disabled>
              <Calendar className="w-4 h-4" />
              {isPaidPlan ? `تجديد: ${formatDate(subscription?.current_period_end || null)}` : "غير محدود"}
            </Button>
          </div>
        </div>
      </motion.div>

      {!isPaidPlan && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">الخطط المتاحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.filter(p => p.id !== "free").map((planItem, index) => (
              <motion.div key={planItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass-card rounded-2xl p-6 border transition-all ${
                  planItem.popular ? "border-primary pricing-popular" : "border-border/50"
                }`}
              >
                {planItem.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Crown className="w-3 h-3 ml-1" />
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{planItem.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{planItem.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${planItem.price}</span>
                    <span className="text-muted-foreground">/ {planItem.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {planItem.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(planItem.id)}
                  disabled={checkoutLoading}
                  className={`w-full ${
                    planItem.popular
                      ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {loadingPlan === planItem.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "ترقية"
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {isPaidPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">طريقة الدفع</h2>
                <p className="text-sm text-muted-foreground">قم بإدارة طرق الدفع عبر Stripe Customer Portal</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={openPortal} disabled={checkoutLoading}>
              <ExternalLink className="w-4 h-4" />
              إدارة الدفع
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardBilling;
