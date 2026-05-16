import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Sparkles,
  Calendar,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "free",
    name: "مجاني",
    price: "0",
    period: "للأبد",
    description: "مثالي للتجربة",
    features: [
      "توأم رقمي واحد",
      "100 رسالة شهرياً",
      "نماذج صوتية أساسية",
      "دعم المجتمع",
    ],
    current: true,
  },
  {
    id: "pro",
    name: "احترافي",
    price: "49",
    period: "شهرياً",
    description: "للاستخدام الشخصي",
    features: [
      "5 توائم رقمية",
      "رسائل غير محدودة",
      "نماذج صوتية متقدمة",
      "أولوية الدعم",
      "تحليلات متقدمة",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "مؤسسات",
    price: "199",
    period: "شهرياً",
    description: "للفرق والشركات",
    features: [
      "توائم غير محدودة",
      "API كامل الوصول",
      "تخصيص كامل",
      "دعم مخصص 24/7",
      "SLA مضمون",
      "إدارة الفريق",
    ],
  },
];

const invoices = [
  { id: "INV-001", date: "2024-01-15", amount: "0 ر.س", status: "مدفوع" },
  { id: "INV-002", date: "2024-02-15", amount: "0 ر.س", status: "مدفوع" },
];

const DashboardBilling = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">الاشتراك والفوترة</h1>
        <p className="text-muted-foreground">إدارة خطتك وطرق الدفع</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">الخطة المجانية</h2>
                <Badge variant="secondary">الحالية</Badge>
              </div>
              <p className="text-muted-foreground">100 رسالة متبقية هذا الشهر</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              تجديد: غير محدود
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">الخطط المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-card rounded-2xl p-6 border transition-all ${
                plan.popular
                  ? "border-primary pricing-popular"
                  : plan.current
                  ? "border-accent/50"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Crown className="w-3 h-3 ml-1" />
                    الأكثر شعبية
                  </Badge>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">ر.س</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.current
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.popular
                    ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    : "bg-muted hover:bg-muted/80"
                }`}
                disabled={plan.current}
              >
                {plan.current ? "الخطة الحالية" : "ترقية"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">طريقة الدفع</h2>
              <p className="text-sm text-muted-foreground">لم يتم إضافة طريقة دفع</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" />
            إضافة بطاقة
          </Button>
        </div>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 border border-border/50"
      >
        <h2 className="font-semibold text-foreground mb-6">سجل الفواتير</h2>
        
        {invoices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد فواتير بعد</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-foreground font-medium">{invoice.amount}</span>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardBilling;
