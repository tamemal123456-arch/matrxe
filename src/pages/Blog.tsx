// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: 1,
    title: "مستقبل التوائم الرقمية في عالم الأعمال",
    excerpt: "كيف ستغير التوائم الرقمية الذكية طريقة تفاعل الشركات مع عملائها",
    category: "تقنية",
    author: "أحمد الشمري",
    date: "15 يناير 2024",
    readTime: "5 دقائق",
    image: "🤖",
  },
  {
    id: 2,
    title: "دليلك الشامل لإنشاء توأم رقمي مثالي",
    excerpt: "خطوات عملية لإنشاء توأم رقمي يعكس شخصيتك بدقة عالية",
    category: "دليل",
    author: "سارة المطيري",
    date: "10 يناير 2024",
    readTime: "8 دقائق",
    image: "📚",
  },
  {
    id: 3,
    title: "الذكاء الاصطناعي والتوائم الرقمية: نظرة مستقبلية",
    excerpt: "استكشاف التقنيات الحديثة التي تدعم التوائم الرقمية الذكية",
    category: "بحث",
    author: "محمد القحطاني",
    date: "5 يناير 2024",
    readTime: "6 دقائق",
    image: "🔬",
  },
  {
    id: 4,
    title: "كيف تحمي خصوصيتك مع التوأم الرقمي",
    excerpt: "نصائح وإرشادات للحفاظ على أمان بياناتك الشخصية",
    category: "أمان",
    author: "نورة العتيبي",
    date: "1 يناير 2024",
    readTime: "4 دقائق",
    image: "🔐",
  },
  {
    id: 5,
    title: "قصص نجاح: كيف ساعدت التوائم الرقمية رواد الأعمال",
    excerpt: "تجارب حقيقية لمستخدمين حققوا نتائج مذهلة",
    category: "قصص",
    author: "أحمد الشمري",
    date: "25 ديسمبر 2023",
    readTime: "7 دقائق",
    image: "🏆",
  },
  {
    id: 6,
    title: "تحديثات ماتركس.إ: ميزات جديدة لعام 2024",
    excerpt: "تعرف على أحدث الميزات والتحسينات في منصتنا",
    category: "أخبار",
    author: "فريق ماتركس.إ",
    date: "20 ديسمبر 2023",
    readTime: "3 دقائق",
    image: "🎉",
  },
];

const categories = ["الكل", "تقنية", "دليل", "بحث", "أمان", "قصص", "أخبار"];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container px-4 sm:px-6 lg:px-8" dir="rtl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-primary mb-4">
              المدونة
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-foreground">أحدث</span>{" "}
              <span className="gradient-text">المقالات والأخبار</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              اكتشف آخر الأخبار والمقالات حول التوائم الرقمية والذكاء الاصطناعي
            </p>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "hero" : "heroOutline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </motion.div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl overflow-hidden mb-12"
          >
            <div className="grid md:grid-cols-2 gap-6 p-8">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-8xl">
                🤖
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm text-primary font-medium mb-2">
                  مقال مميز
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <Button variant="hero" className="w-fit gap-2">
                  اقرأ المزيد
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                      اقرأ المزيد
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button variant="heroOutline" size="lg">
              تحميل المزيد من المقالات
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
