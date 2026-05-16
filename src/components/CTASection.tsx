// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/20 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">احصل على 1000 رصيد مجاني عند التسجيل</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="text-foreground">مستعد لإنشاء</span>
            <br />
            <span className="gradient-text">توأمك الرقمي الذكي؟</span>
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            انضم لأكثر من 10,000 مستخدم يستخدمون ماتركس.إ لتحويل طريقة عملهم وزيادة إنتاجيتهم
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="text-lg">
              ابدأ تجربتك المجانية
            </Button>
            <Button variant="heroOutline" size="xl" className="text-lg">
              حجز عرض توضيحي
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-10 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              بدون بطاقة ائتمان
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              إلغاء في أي وقت
            </span>
            <span className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              دعم فني على مدار الساعة
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
