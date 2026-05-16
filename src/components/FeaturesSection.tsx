// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import iconVoice from "@/assets/icon-voice.png";
import iconChat from "@/assets/icon-chat.png";
import iconTasks from "@/assets/icon-tasks.png";

const features = [
  {
    icon: iconVoice,
    title: "استنساخ الصوت",
    description: "نسخ صوتك بدقة عالية باستخدام تقنيات الذكاء الاصطناعي المتقدمة",
    color: "from-primary to-primary/50",
  },
  {
    icon: iconChat,
    title: "محادثات ذكية",
    description: "تحدث مع توأمك الرقمي واحصل على استشارات ومساعدة في أي وقت",
    color: "from-secondary to-secondary/50",
  },
  {
    icon: iconTasks,
    title: "تنفيذ المهام",
    description: "كلف توأمك الرقمي بتنفيذ المهام نيابةً عنك بشكل تلقائي",
    color: "from-accent to-accent/50",
  },
  {
    iconEmoji: "🔒",
    title: "أمان متقدم",
    description: "بياناتك محمية بأعلى معايير الأمان والتشفير المتقدم",
    color: "from-destructive/80 to-destructive/40",
  },
  {
    iconEmoji: "🌍",
    title: "متعدد اللغات",
    description: "دعم كامل للغات العربية والإنجليزية والفرنسية وغيرها",
    color: "from-primary to-secondary",
  },
  {
    iconEmoji: "⚡",
    title: "سرعة فائقة",
    description: "استجابة فورية وأداء عالي على مدار الساعة",
    color: "from-accent to-primary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
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
            المميزات
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">قدرات</span>{" "}
            <span className="gradient-text">خارقة</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            توأمك الرقمي مزود بأحدث تقنيات الذكاء الاصطناعي لتقديم تجربة استثنائية
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                  {feature.icon ? (
                    <img src={feature.icon} alt={feature.title} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-2xl">{feature.iconEmoji}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <motion.div
                className="mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                ← اعرف المزيد
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
