// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";

const footerLinks = {
  product: {
    title: "المنتج",
    links: [
      { label: "المميزات", href: "#features" },
      { label: "الأسعار", href: "#pricing" },
      { label: "كيف يعمل", href: "#how-it-works" },
      { label: "API", href: "#" },
    ],
  },
  company: {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "المدونة", href: "/blog" },
      { label: "الوظائف", href: "#" },
      { label: "تواصل معنا", href: "/contact" },
    ],
  },
  legal: {
    title: "قانوني",
    links: [
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "شروط الخدمة", href: "/terms" },
      { label: "سياسة الاسترداد", href: "#" },
    ],
  },
  social: {
    title: "تابعنا",
    links: [
      { label: "تويتر", href: "#", icon: "𝕏" },
      { label: "لينكدإن", href: "#", icon: "in" },
      { label: "يوتيوب", href: "#", icon: "▶" },
      { label: "تيليجرام", href: "#", icon: "✈" },
    ],
  },
};

const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-border/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent" />
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="ماتركس.إ" className="w-12 h-12" />
              <span className="text-2xl font-bold gradient-text">ماتركس.إ</span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              منصة الذكاء الاصطناعي الرائدة لإنشاء التوائم الرقمية الذكية التي تحاكي شخصيتك
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold cyber-glow"
              >
                اشترك
              </motion.button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">{footerLinks.product.title}</h4>
            <ul className="space-y-2">
              {footerLinks.product.links.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{footerLinks.company.title}</h4>
            <ul className="space-y-2">
              {footerLinks.company.links.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{footerLinks.legal.title}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.links.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border/50 gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ماتركس.إ. جميع الحقوق محفوظة.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {footerLinks.social.links.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                {link.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
