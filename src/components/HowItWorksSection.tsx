// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "سجّل حسابك",
    description: "أنشئ حسابك مجاناً في دقائق معدودة",
    icon: "👤",
  },
  {
    number: "02",
    title: "ارفع عينات صوتك",
    description: "سجل بعض العينات الصوتية لتدريب التوأم",
    icon: "🎙️",
  },
  {
    number: "03",
    title: "خصص شخصيته",
    description: "حدد سمات الشخصية وأسلوب التواصل",
    icon: "⚙️",
  },
  {
    number: "04",
    title: "ابدأ التواصل",
    description: "تحدث مع توأمك الرقمي واستمتع بالتجربة",
    icon: "💬",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
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
            كيف يعمل
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">أربع خطوات</span>{" "}
            <span className="gradient-text">بسيطة</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            إنشاء توأمك الرقمي أسهل مما تتخيل
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 right-0 left-0 h-0.5 bg-gradient-to-l from-primary via-secondary to-accent -translate-y-1/2" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="glass-card rounded-2xl p-6 text-center relative z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-4 right-1/2 translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl glass-card mx-auto mb-4 flex items-center justify-center text-3xl">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-4 -translate-y-1/2 text-primary text-2xl">
                    ←
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] text-primary-foreground font-bold text-lg cyber-glow hover:animate-gradient-shift"
          >
            ابدأ الآن مجاناً
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
