// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoIcon from "@/assets/logo-icon.png";

const navLinks = [
  { href: "#features", label: "المميزات", labelEn: "Features" },
  { href: "#how-it-works", label: "كيف يعمل", labelEn: "How it works" },
  { href: "#pricing", label: "الأسعار", labelEn: "Pricing" },
];

const languages = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("ar");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass-card rounded-2xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <img src={logoIcon} alt="ماتركس.إ" className="w-10 h-10" />
              <span className="text-xl font-bold gradient-text hidden sm:block">ماتركس.إ</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6" dir="rtl">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {currentLang === "ar" ? link.label : link.labelEn}
                </a>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg glass-card hover:bg-muted/50 transition-colors"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{languages.find(l => l.code === currentLang)?.flag}</span>
                </button>
                
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 glass-card rounded-xl py-2 min-w-32"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                            currentLang === lang.code ? "text-primary" : "text-foreground"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard">لوحة التحكم</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <User className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 ml-2" />
                          تسجيل الخروج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/auth">تسجيل الدخول</Link>
                    </Button>
                    <Button variant="hero" size="sm" asChild>
                      <Link to="/auth">ابدأ مجاناً</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {isOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-border/50 mt-3" dir="rtl">
                  <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {currentLang === "ar" ? link.label : link.labelEn}
                      </a>
                    ))}
                    <div className="flex gap-2 mt-2">
                      {user ? (
                        <>
                          <Button variant="hero" size="sm" className="flex-1" asChild>
                            <Link to="/dashboard">لوحة التحكم</Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>
                            تسجيل الخروج
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="flex-1" asChild>
                            <Link to="/auth">تسجيل الدخول</Link>
                          </Button>
                          <Button variant="hero" size="sm" className="flex-1" asChild>
                            <Link to="/auth">ابدأ مجاناً</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
