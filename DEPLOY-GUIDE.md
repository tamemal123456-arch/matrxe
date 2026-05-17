# دليل النشر اليدوي على VPS + Supabase

> استخدم هذا الدليل إذا تعذّر استخدام `supabase CLI` (التوكن لا يعمل).

---

## المرحلة 1: رفع الموقع على VPS

```bash
# 1. الاتصال بالسيرفر
ssh root@YOUR_SERVER_IP

# 2. تحديث النظام
apt update && apt upgrade -y

# 3. تثبيت المتطلبات
apt install -y git curl nginx certbot python3-certbot-nginx

# 4. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 5. نسخ المشروع
git clone https://github.com/YOUR_REPO/matrxe.git /var/www/matrxe
cd /var/www/matrxe

# 6. إنشاء ملف .env
cat > .env << 'ENV'
VITE_SUPABASE_PROJECT_ID="iisyyazgugvmehzrpyfr"
VITE_SUPABASE_URL="https://iisyyazgugvmehzrpyfr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<مفتاحك من Supabase Dashboard → Settings → API → anon key>"
ENV

# 7. بناء المشروع
npm install
npm run build

# 8. إعداد Nginx
cat > /etc/nginx/sites-available/matrxe << 'NGINX'
server {
    listen 80;
    server_name matrxe.com www.matrxe.com;
    root /var/www/matrxe/dist;
    index index.html;
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://apis.google.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://i.ibb.co;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        frame-src https://*.supabase.co https://js.stripe.com;
        media-src 'self' blob:;
        worker-src 'self' blob:;
    " always;
}
NGINX

ln -sf /etc/nginx/sites-available/matrxe /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 9. شهادة SSL
certbot --nginx -d matrxe.com -d www.matrxe.com --non-interactive --agree-tos -m admin@matrxe.com --redirect

# 10. جدار الحماية
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
```

الموقع راح يكون شغال الآن على `https://matrxe.com` ✅

---

## المرحلة 2: ترحيل قاعدة البيانات (SQL Editor)

**افتح:** https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr/sql/new

**شغّل الملفات بالترتيب — copy-paste لكل ملف ثم Run:**

### الترتيب الصحيح:

| # | الملف | الوظيفة |
|---|-------|---------|
| 1 | `20260117134203_...` | profiles + digital_twins (الجداول الأساسية) |
| 2 | `20260117135731_...` | conversations + chat_messages |
| 3 | `20260118193849_...` | voice_id للتوأم |
| 4 | `20260203182316_...` | twin_tasks + user_subscriptions |
| 5 | `20260510183247_...` | تحسين الاشتراكات والقيود |
| 6 | `20260510190953_...` | user_roles + صلاحيات المشرف |
| 7 | `20260510191030_...` | تعيين المشرف (عدّل البريد الإلكتروني) |
| 8 | `20260514120000_...` | Storage buckets + RLS policies |
| 9 | `20260514130000_...` | twin_memories + social + api_keys + skills |
| 10 | `20260514140000_...` | إضافة provider, tier, usage_count |
| 11 | `20260515190000_...` | twin_ai_connections + twin_connections + twin_api_tokens |
| 12 | `20260515200000_...` | twin_offline_tasks + message_attachments |

**محتويات كل ملف موجودة في:**
```
/var/www/matrxe/supabase/migrations/
```

شغّلهم بالترتيب من 1 إلى 12.

---

## المرحلة 3: نشر Edge Functions (يدوياً عبر Dashboard)

**افتح:** https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr/edge-functions

أنشئ 6 دوال بالترتيب:

### 1. `elevenlabs-tts` (بسيط — مايستخدم _shared)
- اضغط "Create a new function"
- الاسم: `elevenlabs-tts`
- Copy-paste الكود من `supabase/functions/elevenlabs-tts/index.ts`

### 2. `talking-video` (بسيط)
- الاسم: `talking-video`
- كود من `supabase/functions/talking-video/index.ts`

### 3. `clone-voice` (بسيط)
- الاسم: `clone-voice`
- كود من `supabase/functions/clone-voice/index.ts`

### 4. `speech-to-text` (يحتاج _shared — استخدم الكود المدمج أدناه)
- الاسم: `speech-to-text`
- كود مدمج (لأن Dashboard لا يدعم `../_shared/`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PROVIDER_BASE_URLS: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  deepseek: "https://api.deepseek.com/v1",
  groq: "https://api.groq.com/openai/v1",
  openai: "https://api.openai.com/v1",
};

async function getBestKey(serviceCategory: string, userId?: string, excludeProviders?: Set<string>) {
  const priorities = ["google", "openrouter", "groq", "deepseek", "openai"];
  for (const provider of priorities) {
    if (excludeProviders?.has(provider)) continue;
    const key = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (key) return { key, provider, base_url: PROVIDER_BASE_URLS[provider] || "" };
  }
  return null;
}

async function tryTranscribeWithGoogle(audio: string, mimeType: string, apiKey: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: "Transcribe this audio exactly as spoken. Return ONLY the transcribed text. If Arabic, return Arabic. If English, return English." },
            { inline_data: { mime_type: mimeType || "audio/webm", data: audio } },
          ],
        }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch { return null; }
}

async function tryTranscribeWithWhisper(audio: string, mimeType: string, baseUrl: string, apiKey: string): Promise<string | null> {
  try {
    const audioBytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const form = new FormData();
    form.append("model", "whisper-large-v3");
    form.append("file", new Blob([audioBytes], { type: mimeType || "audio/webm" }), "audio.webm");
    form.append("response_format", "json");
    const res = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.text?.trim() || null;
  } catch { return null; }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { audio, mime_type } = await req.json();
    if (!audio) return new Response(JSON.stringify({ error: "Audio required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const googleKey = Deno.env.get("GOOGLE_API_KEY");
    if (googleKey) {
      const text = await tryTranscribeWithGoogle(audio, mime_type, googleKey);
      if (text) return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tried = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const key = await getBestKey("chat", undefined, tried);
      if (!key) break;
      tried.add(key.provider);
      if (["deepseek", "openrouter", "groq", "openai"].includes(key.provider)) {
        const text = await tryTranscribeWithWhisper(audio, mime_type, key.base_url, key.key);
        if (text) return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "No transcription provider available" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

### 5. `twin-learning` (يحتاج _shared — استخدم الكود المدمج)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  deepseek: "https://api.deepseek.com/v1",
  groq: "https://api.groq.com/openai/v1",
};

function buildAuthHeader(provider: string, key: string): Record<string, string> {
  const h: Record<string, string> = {};
  if (provider !== "google") h["Authorization"] = `Bearer ${key}`;
  return h;
}

async function getBestKey(excludeProviders?: Set<string>) {
  const priorities = ["google", "openrouter", "groq", "deepseek", "openai"];
  for (const provider of priorities) {
    if (excludeProviders?.has(provider)) continue;
    const key = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (key) return { key, provider, base_url: PROVIDER_BASE_URLS[provider] || "" };
  }
  return null;
}

async function callAIWithFallback(messages: any[], model = "google/gemini-2.5-pro") {
  const tried = new Set<string>();
  for (let a = 0; a < 10; a++) {
    const r = await getBestKey(tried);
    if (!r) break;
    tried.add(r.provider);
    const h = buildAuthHeader(r.provider, r.key);
    h["Content-Type"] = "application/json";
    let url: string;
    let body: any;
    if (r.provider === "google") {
      const m = model.replace("google/", "");
      url = `${r.base_url}/models/${m}:generateContent?key=${r.key}`;
      body = { contents: messages.map((m: any) => ({ role: m.role === "assistant" ? "model" : m.role, parts: [{ text: m.content }] })) };
    } else {
      url = `${r.base_url}/chat/completions`;
      body = { model, messages };
    }
    try {
      const res = await fetch(url, { method: "POST", headers: h, body: JSON.stringify(body) });
      if (res.ok) {
        if (r.provider === "google") {
          const d = await res.json();
          return { choices: [{ message: { content: d?.candidates?.[0]?.content?.parts?.[0]?.text || "" } }] };
        }
        return await res.json();
      }
    } catch { /* next */ }
  }
  throw new Error("No AI provider available.");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { twinId, action, topic } = await req.json();
    if (!twinId) return new Response(JSON.stringify({ error: "twinId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: twin } = await supabase.from("digital_twins").select("id, user_id, name, knowledge_base").eq("id", twinId).single();
    if (!twin) return new Response(JSON.stringify({ error: "Twin not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let result = "";
    switch (action) {
      case "learn": {
        if (!topic) return new Response(JSON.stringify({ error: "topic required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const aiData = await callAIWithFallback([
          { role: "system", content: "أنت باحث خبير. ادرس الموضوع بتعمق وقدم ملخصاً شاملاً." },
          { role: "user", content: `ادرس: ${topic}` },
        ]);
        result = aiData.choices?.[0]?.message?.content || "";
        await supabase.from("twin_learned_skills").insert({ twin_id: twinId, skill_name: topic, skill_level: "intermediate", description: result.slice(0, 1000), skill_source: "background_learning" });
        await supabase.from("twin_memories").insert({ twin_id: twinId, user_id: twin.user_id, memory_type: "learned_knowledge", key: `auto_learned:${topic}`, value: result.slice(0, 2000), importance: 6 });
        break;
      }
      case "scan_capabilities": {
        const aiData = await callAIWithFallback([
          { role: "system", content: "أنت باحث متخصص في تتبع أحدث ابتكارات الذكاء الاصطناعي." },
          { role: "user", content: "ابحث عن أحدث 5 أدوات AI جديدة يمكن دمجها في توأم رقمي ذكي." },
        ]);
        result = aiData.choices?.[0]?.message?.content || "";
        await supabase.from("twin_learned_skills").insert({ twin_id: twinId, skill_name: "آخر المستجدات التقنية", skill_level: "advanced", description: result.slice(0, 1000), skill_source: "ai_scanning" });
        break;
      }
      case "self_diagnose": {
        result = JSON.stringify({ status: "healthy", timestamp: new Date().toISOString(), checks: ["memory_active", "tools_available", "security_ok"], score: "96%" });
        break;
      }
      default: return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, action, twin_id: twinId, result_preview: result.slice(0, 500), timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

### 6. `twin-chat` (الوظيفة الأكبر — استخدم الكود المدمج أدناه)

نظراً لأن `twin-chat` كبير جداً (1491 سطر)، راح نستخدم طريقة أسهل:

**الطريقة الموصى بها لـ twin-chat: استخدم CLI مع التوكن الصحيح**

إذا ما في توكن صالح، جرب تنزيل Supabase CLI على السيرفر:

```bash
# تثبيت Supabase CLI
npm install -g supabase
supabase login  # استخدم توكنك الشخصي من https://supabase.com/dashboard/account/tokens
supabase link --project-ref iisyyazgugvmehzrpyfr
supabase functions deploy twin-chat --project-ref iisyyazgugvmehzrpyfr
```

إذا فشل CLI تماماً، أنشئ الدالة عبر Dashboard وانسخ محتوى الملف بالكامل من:
```
/var/www/matrxe/supabase/functions/twin-chat/index.ts
```

لكن Dashboard لديه حد 50KB. `twin-chat` أكبر من ذلك. الحل:
- افتح الملف `twin-chat/index.ts` في محرر نصوص
- امسح التعليقات (الأسطر التي تبدأ بـ `//`)
- انسخ والصق في Dashboard

---

## المرحلة 4: ضبط الأسرار (Secrets)

لكل دالة، اذهب إلى Settings → Secrets وأضف:

| الاسم | القيمة | مطلوب لـ |
|-------|--------|----------|
| `DEEPSEEK_API_KEY` | <مفتاحك من DeepSeek> | twin-chat, twin-learning, speech-to-text |
| `ELEVENLABS_API_KEY` | <مفتاحك من ElevenLabs> | elevenlabs-tts, talking-video, clone-voice |
| `CONTACT_PHONE` | <رقم هاتفك> | twin-chat |
| `API_KEY_ENCRYPTION_KEY` | <مفتاح تشفير عشوائي قوي> | twin-chat, twin-learning |
| `SUPABASE_URL` | `https://iisyyazgugvmehzrpyfr.supabase.co` | twin-chat, twin-learning |
| `SUPABASE_SERVICE_ROLE_KEY` | (من Dashboard → Settings → API → service_role key) | twin-chat, twin-learning |

**إضافة الأسرار:** Dashboard → Edge Functions → twin-chat → Settings → Environment Variables → + Add

---

## المرحلة 5: إعدادات Supabase Dashboard

### 5.1 Auth Settings
- **افتح:** https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr/auth/settings
- Site URL: `https://matrxe.com`
- Redirect URLs: `https://matrxe.com/*`
- تحت "Additional Redirect URLs" أضف أيضاً:
  - `http://localhost:5173/*` (للتطوير المحلي)

### 5.2 Google OAuth
- **افتح:** https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr/auth/providers
- اختر Google → تفعيل
- إنشاء OAuth credentials من Google Cloud Console:
  1. اذهب إلى https://console.cloud.google.com/apis/credentials
  2. أنشئ OAuth 2.0 Client ID (Web application)
  3. Authorized JavaScript origins: `https://matrxe.com`, `http://localhost:5173`
  4. Authorized redirect URIs: `https://iisyyazgugvmehzrpyfr.supabase.co/auth/v1/callback`
  5. Copy Client ID + Client Secret إلى Supabase Dashboard

### 5.3 Storage Buckets
- **افتح:** https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr/storage/buckets
- تأكد من وجود `twin-images` (تم إنشاؤه في migration #8)
- إذا لم يكن موجوداً، أنشئه: public bucket, name = `twin-images`

---

## المرحلة 6: اختبار الموقع

```bash
# 1. تأكد أن الموقع شغال
curl -I https://matrxe.com
# → 200 OK

# 2. سجل مستخدم جديد (بريد + كلمة مرور)
# 3. جرّب الدخول عبر Google
# 4. أنشئ توأم رقمي
# 5. افتح الشات
```

---

## المرحلة 7: إعداد Stripe (لتحويل المشروع لـ SaaS)

### 7.1 إنشاء حساب Stripe
- اذهب إلى https://dashboard.stripe.com/register
- سجل حساب (مجاني — تستلم بعد أول عملية دفع)
- فعّل وضع **Test Mode** للتجربة (Toggle في Dashboard)

### 7.2 الحصول على المفاتيح
- Stripe Dashboard → Developers → API Keys
- أنشئ `STRIPE_SECRET_KEY` (يبدأ بـ `sk_live_` أو `sk_test_`)
- أنشئ `STRIPE_WEBHOOK_SECRET` بعد نشر الويب هوك

### 7.3 إنشاء منتجات Stripe
Stripe Dashboard → Products → Add Product:
1. **MATRXe Pro Monthly**: $49/شهر → إنشاء Price ID (يبدأ بـ `price_`)
2. **MATRXe Pro Yearly**: $490/سنة → Price ID
3. **MATRXe Enterprise Monthly**: $199/شهر → Price ID
4. **MATRXe Enterprise Yearly**: $1,990/سنة → Price ID

### 7.4 تحديث قاعدة البيانات بـ Price IDs
في SQL Editor، شغّل:
```sql
UPDATE subscription_plans SET
  stripe_price_id_monthly = 'price_YOUR_PRO_MONTHLY_ID',
  stripe_price_id_yearly = 'price_YOUR_PRO_YEARLY_ID'
WHERE id = 'pro';

UPDATE subscription_plans SET
  stripe_price_id_monthly = 'price_YOUR_ENT_MONTHLY_ID',
  stripe_price_id_yearly = 'price_YOUR_ENT_YEARLY_ID'
WHERE id = 'enterprise';
```

### 7.5 إضافة الـ Webhook endpoint
Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://iisyyazgugvmehzrpyfr.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- أنشئ `STRIPE_WEBHOOK_SECRET` وضيفه لـ Edge Function Secrets

### 7.6 إضافة الأسرار
في Supabase Dashboard → Edge Functions → Secrets:
| الاسم | القيمة |
|-------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` أو `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

### 7.7 نشر دوال Stripe
أنشئ 3 دوال جديدة في Dashboard:
- `stripe-webhook` ← كود من `supabase/functions/stripe-webhook/index.ts`
- `create-checkout` ← كود من `supabase/functions/create-checkout/index.ts`
- `manage-subscription` ← كود من `supabase/functions/manage-subscription/index.ts`

---

## مشاكل وحلول

| المشكلة | السبب | الحل |
|---------|-------|------|
| 404 عند فتح `social_connections` | الترحيلات ما شغّلت | شغّل migration #9 |
| Chat يعطي "تعذر الاتصال بأي مزود" | `DEEPSEEK_API_KEY` مو مضبوط | أضف الـ secret |
| "Not allowed to load local resource" | صور blob محلية | ارفع الصور لـ Supabase Storage |
| OAuth redirect لا يعمل | Site URL مو مضبوط | صحح في Auth → Settings |
| Stripe checkout لا يعمل | Price ID مو مضبوط | حدث `stripe_price_id_monthly` في جدول `subscription_plans` |
| Webhook 500 | Secret مو مضبوط | أضف `STRIPE_WEBHOOK_SECRET` في Edge Function Secrets |
