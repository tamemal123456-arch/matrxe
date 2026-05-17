import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code,
  Shield,
  Key,
  Globe,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Terminal,
} from "lucide-react";
import { useState } from "react";

const endpoints = [
  {
    method: "POST",
    path: "/functions/v1/twin-chat",
    auth: "Bearer (session.access_token)",
    desc: "إرسال رسالة إلى توأم رقمي واستقبال رد ذكي",
    example: `{
  "twinId": "uuid",
  "message": "مرحباً",
  "history": []
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/twin-learning",
    auth: "Bearer (session.access_token)",
    desc: "تشغيل التعلم الخلفي للتوأم (اكتساب مهارات جديدة)",
    example: `{
  "twinId": "uuid",
  "action": "learn",
  "topic": "الذكاء الاصطناعي"
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/speech-to-text",
    auth: "Bearer (session.access_token)",
    desc: "تحويل الصوت إلى نص باستخدام AI",
    example: `{
  "audio": "base64...",
  "mime_type": "audio/webm"
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/elevenlabs-tts",
    auth: "None (verify_jwt=false)",
    desc: "تحويل النص إلى صوت طبيعي (بدون توثيق)",
    example: `{
  "text": "مرحباً بكم في MATRXe",
  "voiceId": "uuid"
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/talking-video",
    auth: "None (verify_jwt=false)",
    desc: "إنشاء فيديو متحدث من صورة ثابتة",
    example: `{
  "image": "base64...",
  "text": "مرحباً",
  "voiceId": "uuid"
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/stripe-webhook",
    auth: "None (verify_jwt=false)",
    desc: "استقبال أحداث Stripe (checkout, subscription)",
    example: "→ يرسله Stripe تلقائياً",
  },
  {
    method: "POST",
    path: "/functions/v1/create-checkout",
    auth: "Bearer (session.access_token)",
    desc: "إنشاء جلسة دفع Stripe",
    example: `{
  "planId": "pro",
  "billingInterval": "monthly"
}`,
  },
  {
    method: "POST",
    path: "/functions/v1/manage-subscription",
    auth: "Bearer (session.access_token)",
    desc: "فتح بوابة إدارة الاشتراك في Stripe",
    example: "{}",
  },
  {
    method: "POST",
    path: "/functions/v1/send-email",
    auth: "Bearer (session.access_token)",
    desc: "إرسال بريد إلكتروني عبر SMTP",
    example: `{
  "to": "user@example.com",
  "template": "welcome",
  "vars": {"name": "أحمد"}
}`,
  },
  {
    method: "GET",
    path: "/functions/v1/health-check",
    auth: "None (verify_jwt=false)",
    desc: "فحص صحة النظام (uptime, env, encoding)",
    example: "→ no body required",
  },
  {
    method: "POST",
    path: "/functions/v1/data-export",
    auth: "Bearer (session.access_token)",
    desc: "تصدير بيانات المستخدم (متوافق مع GDPR)",
    example: `{
  "types": ["twins", "conversations", "memories", "settings"]
}`,
  },
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/80 rounded-lg p-3 overflow-x-auto font-mono-tech text-left ltr">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
};

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass-card border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">توثيق API</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </Link>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 ml-2" />
                Supabase Docs
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Introduction */}
          <div className="glass-card rounded-xl border border-border/50 p-6">
            <h2 className="text-2xl font-bold mb-4">Edge Functions API</h2>
            <p className="text-muted-foreground mb-4">
              جميع دوال MATRXe منشورة على Supabase Edge Functions وتُستدعى عبر:
            </p>
            <CodeBlock code={`https://iisyyazgugvmehzrpyfr.supabase.co/functions/v1/{function-name}`} />
            <div className="mt-4 flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="block mb-1">المصادقة</strong>
                <p className="text-muted-foreground">
                  معظم الدوال تتطلب <code className="bg-muted px-1 rounded">Authorization: Bearer {`{session.access_token}`}</code>.
                  الدوال التي لا تحتاج توثيقاً (verify_jwt=false) مخصصة للاستدعاء من المتصفح مباشرة.
                </p>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="glass-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">كيفية المصادقة</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. من المتصفح (Client-side)</h3>
                <CodeBlock code={`const { data: { session } } = await supabase.auth.getSession();
const res = await fetch(
  "https://iisyyazgugvmehzrpyfr.supabase.co/functions/v1/twin-chat",
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${session.access_token}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ twinId: "...", message: "مرحباً" }),
  }
);`} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. من الخادم (Server-side)</h3>
                <CodeBlock code={`// داخل Edge Function نفسها
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);`} />
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <h2 className="text-2xl font-bold">قائمة الدوال</h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl border border-border/50 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-mono-tech font-bold",
                      ep.method === "GET" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono-tech">{ep.path}</code>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    ep.auth === "None (verify_jwt=false)"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-primary/10 text-primary"
                  )}>
                    {ep.auth}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ep.desc}</p>
                {ep.example && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
                      <Terminal className="w-3 h-3" />
                      <span>مثال</span>
                    </div>
                    <CodeBlock code={ep.example} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Base URL */}
          <div className="glass-card rounded-xl border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Base URL</h2>
            </div>
            <CodeBlock code="https://iisyyazgugvmehzrpyfr.supabase.co" />
            <p className="text-sm text-muted-foreground mt-3">
              جميع الـ endpoints أعلاه تُسبق بـ <code className="bg-muted px-1 rounded">/functions/v1/</code>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

import { cn } from "@/lib/utils";
export default ApiDocs;
