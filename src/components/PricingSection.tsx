// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "مجانية",
    nameEn: "Free",
    price: "0",
    period: "للأبد",
    description: "ابدأ رحلتك مع التوأم الرقمي",
    features: [
      "محادثات نصية محدودة يومياً",
      "محادثات صوتية محدودة",
      "توأم رقمي واحد",
      "دعم عبر البريد الإلكتروني",
    ],
    popular: false,
    buttonVariant: "heroOutline" as const,
  },
  {
    name: "أساسية",
    nameEn: "Basic",
    price: "29",
    period: "شهرياً",
    description: "للمستخدمين النشطين",
    features: [
      "محادثات نصية غير محدودة",
      "محادثات صوتية غير محدودة",
      "توأم رقمي واحد",
      "دعم ذو أولوية",
      "تخصيص الشخصية",
    ],
    popular: false,
    buttonVariant: "heroOutline" as const,
  },
  {
    name: "احترافية",
    nameEn: "Pro",
    price: "59",
    period: "شهرياً",
    description: "للمحترفين ورواد الأعمال",
    features: [
      "كل مميزات الخطة الأساسية",
      "تنفيذ مهام محدودة",
      "يتطلب اتصال التوأمين",
      "تقارير وإحصائيات",
      "API للمطورين",
    ],
    popular: true,
    buttonVariant: "hero" as const,
  },
  {
    name: "متقدمة",
    nameEn: "Advanced",
    price: "119",
    period: "شهرياً",
    description: "قوة غير محدودة",
    features: [
      "كل مميزات الخطة الاحترافية",
      "مهام أكثر بلا اتصال",
      "توائم متعددة",
      "أولوية في المعالجة",
      "مدير حساب مخصص",
    ],
    popular: false,
    buttonVariant: "heroOutline" as const,
  },
  {
    name: "غير محدودة",
    nameEn: "Unlimited",
    price: "239",
    period: "شهرياً",
    description: "لا حدود لطموحاتك",
    features: [
      "كل شيء غير محدود",
      "جميع أنواع المهام",
      "توائم غير محدودة",
      "دعم VIP 24/7",
      "تكامل مخصص",
      "SLA مضمون",
    ],
    popular: false,
    buttonVariant: "heroOutline" as const,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-primary mb-4">
            الأسعار
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">خطط تناسب</span>{" "}
            <span className="gradient-text">احتياجاتك</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ابدأ مجاناً وقم بالترقية حسب نمو احتياجاتك
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.popular 
                  ? "pricing-popular" 
                  : "glass-card"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-primary-foreground">
                    الأكثر طلباً
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.nameEn}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                variant={plan.buttonVariant} 
                className="w-full"
                size="lg"
              >
                {plan.price === "0" ? "ابدأ مجاناً" : "اشترك الآن"}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          * جميع الخطط تشمل فترة تجريبية 30 يوم. يمكنك الإلغاء في أي وقت.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
