import { motion } from "framer-motion";
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "كيف أنشئ توأم رقمي؟",
    answer: "يمكنك إنشاء توأم رقمي من خلال الضغط على زر 'إنشاء توأم جديد' في لوحة التحكم، ثم اتباع الخطوات لإضافة الاسم والشخصية وعينات الصوت.",
  },
  {
    question: "كم عدد الرسائل المتاحة في الخطة المجانية؟",
    answer: "الخطة المجانية تتيح لك 100 رسالة شهرياً مع توأم رقمي واحد. يمكنك الترقية للحصول على رسائل غير محدودة.",
  },
  {
    question: "هل يمكنني تخصيص صوت التوأم الرقمي؟",
    answer: "نعم! يمكنك رفع عينات صوتية خاصة بك ليقوم النظام باستنساخ الصوت بدقة عالية باستخدام تقنية ElevenLabs.",
  },
  {
    question: "كيف أحذف توأم رقمي؟",
    answer: "يمكنك حذف التوأم من خلال الضغط على أيقونة القائمة (النقاط الثلاث) بجانب التوأم واختيار 'حذف'. يرجى ملاحظة أن هذا الإجراء لا يمكن التراجع عنه.",
  },
  {
    question: "هل بياناتي آمنة؟",
    answer: "نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك. جميع المحادثات مشفرة ولا يمكن الوصول إليها إلا من قبلك.",
  },
];

const resources = [
  {
    title: "دليل البدء السريع",
    description: "تعلم كيفية إنشاء توأمك الرقمي الأول",
    icon: Book,
    href: "#",
  },
  {
    title: "الوثائق التقنية",
    description: "API والتكاملات المتاحة",
    icon: ExternalLink,
    href: "#",
  },
  {
    title: "مجتمع المطورين",
    description: "انضم لمجتمعنا على Discord",
    icon: MessageCircle,
    href: "#",
  },
];

const DashboardHelp = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">المساعدة والدعم</h1>
        <p className="text-muted-foreground">اعثر على إجابات لأسئلتك</p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="ابحث عن سؤال أو موضوع..."
          className="pr-12 h-12 text-lg bg-muted/50 border-border/50"
        />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <motion.a
            key={resource.title}
            href={resource.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <resource.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </motion.a>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">الأسئلة الشائعة</h2>
            <p className="text-sm text-muted-foreground">إجابات سريعة لأكثر الأسئلة شيوعاً</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-muted/30 rounded-xl px-4 border-none"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-foreground text-right">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-8 border border-border/50 text-center bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">لم تجد إجابتك؟</h2>
        <p className="text-muted-foreground mb-6">فريق الدعم لدينا جاهز لمساعدتك</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2">
            <MessageCircle className="w-5 h-5" />
            محادثة مباشرة
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="w-5 h-5" />
            إرسال بريد
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHelp;
