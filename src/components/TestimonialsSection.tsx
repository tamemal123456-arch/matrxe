// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "أحمد الخالدي",
    role: "رائد أعمال",
    avatar: "👨‍💼",
    content: "منصة ماتركس.إ غيرت طريقة عملي بالكامل. توأمي الرقمي يساعدني في الرد على العملاء والاستشارات على مدار الساعة.",
    rating: 5,
  },
  {
    name: "سارة المنصور",
    role: "مستشارة قانونية",
    avatar: "👩‍⚖️",
    content: "دقة استنساخ الصوت مذهلة! عملائي لا يستطيعون التفريق بين صوتي وصوت توأمي الرقمي.",
    rating: 5,
  },
  {
    name: "محمد العتيبي",
    role: "مدرب تطوير ذاتي",
    avatar: "👨‍🏫",
    content: "أستخدم المنصة لتقديم جلسات تدريبية مسجلة بصوتي. وفرت لي وقتاً هائلاً وزادت من انتاجيتي.",
    rating: 5,
  },
  {
    name: "نورة القحطاني",
    role: "صانعة محتوى",
    avatar: "👩‍💻",
    content: "المنصة سهلة الاستخدام وفريق الدعم رائع. توأمي الرقمي يرد على متابعيني بشكل احترافي.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
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
            آراء العملاء
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">ماذا يقول</span>{" "}
            <span className="gradient-text">مستخدمونا</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم لآلاف المستخدمين الذين غيروا طريقة عملهم مع ماتركس.إ
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Avatar & Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-accent">⭐</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed text-sm">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-12 border-t border-border/50"
        >
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">4.9/5</div>
            <div className="text-sm text-muted-foreground">تقييم المستخدمين</div>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">10K+</div>
            <div className="text-sm text-muted-foreground">مستخدم نشط</div>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">150+</div>
            <div className="text-sm text-muted-foreground">دولة حول العالم</div>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">99.9%</div>
            <div className="text-sm text-muted-foreground">معدل الرضا</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
