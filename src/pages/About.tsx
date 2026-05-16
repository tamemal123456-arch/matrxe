// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Award, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoIcon from "@/assets/logo-icon.png";

const teamMembers = [
  {
    name: "أحمد الشمري",
    role: "المؤسس والرئيس التنفيذي",
    bio: "خبير في الذكاء الاصطناعي مع 15 عاماً من الخبرة",
    avatar: "👨‍💼",
  },
  {
    name: "سارة المطيري",
    role: "رئيسة قسم التقنية",
    bio: "مهندسة برمجيات متخصصة في ML و NLP",
    avatar: "👩‍💻",
  },
  {
    name: "محمد القحطاني",
    role: "مدير المنتج",
    bio: "خبير في تجربة المستخدم وتطوير المنتجات",
    avatar: "👨‍🎨",
  },
  {
    name: "نورة العتيبي",
    role: "رئيسة التسويق",
    bio: "متخصصة في النمو والتسويق الرقمي",
    avatar: "👩‍💼",
  },
];

const values = [
  {
    icon: Users,
    title: "المستخدم أولاً",
    description: "نضع احتياجات مستخدمينا في قلب كل قرار نتخذه",
  },
  {
    icon: Target,
    title: "الابتكار المستمر",
    description: "نسعى دائماً لتقديم حلول مبتكرة تتجاوز التوقعات",
  },
  {
    icon: Award,
    title: "الجودة العالية",
    description: "نلتزم بأعلى معايير الجودة في كل ما نقدمه",
  },
  {
    icon: Sparkles,
    title: "الشفافية",
    description: "نؤمن بالصدق والوضوح في تعاملاتنا",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container px-4 sm:px-6 lg:px-8 mb-20" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <img src={logoIcon} alt="ماتركس.إ" className="w-20 h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">من نحن في</span>{" "}
              <span className="gradient-text">ماتركس.إ</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نحن فريق من المبتكرين الشغوفين بتقنيات الذكاء الاصطناعي، نسعى لتمكين الجميع من إنشاء توائم رقمية ذكية تحاكي شخصياتهم
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-muted/30" dir="rtl">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-primary mb-4">
                  رسالتنا
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  نحول الخيال إلى واقع رقمي
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  نؤمن بأن التكنولوجيا يجب أن تكون في متناول الجميع. من خلال ماتركس.إ، نمكن الأفراد والشركات من إنشاء توائم رقمية ذكية تتحدث بأصواتهم وتعكس شخصياتهم.
                </p>
                <p className="text-lg text-muted-foreground">
                  هدفنا هو جعل التفاعل مع الذكاء الاصطناعي تجربة شخصية وفريدة، تخدم احتياجات المستخدمين وتوفر لهم الوقت والجهد.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-2xl p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">+10,000</h3>
                      <p className="text-sm text-muted-foreground">مستخدم نشط</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">+50,000</h3>
                      <p className="text-sm text-muted-foreground">توأم رقمي تم إنشاؤه</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">+5 مليون</h3>
                      <p className="text-sm text-muted-foreground">محادثة تمت</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20" dir="rtl">
          <div className="container px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-primary mb-4">
                قيمنا
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">
                المبادئ التي توجهنا
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30" dir="rtl">
          <div className="container px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-primary mb-4">
                فريقنا
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">
                العقول وراء ماتركس.إ
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center group hover:border-primary/50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-4xl">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" dir="rtl">
          <div className="container px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                انضم إلينا في رحلتنا
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                ابدأ في إنشاء توأمك الرقمي اليوم واكتشف إمكانيات لا حدود لها
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth" className="gap-2">
                  ابدأ مجاناً
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
