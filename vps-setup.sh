#!/bin/bash
set -e

DOMAIN="matrxe.com"
EMAIL="admin@matrxe.com"
DIR="/var/www/matrxe"
REPO_URL="" # << املأ رابط المستودع (GitHub/GitLab)

# ─── 1. Install system dependencies ───
echo ">>> Installing system dependencies..."
apt update && apt upgrade -y
apt install -y git curl nodejs nginx certbot python3-certbot-nginx ufw

# ─── 2. Clone project ───
echo ">>> Cloning project..."
mkdir -p "$DIR"
if [ -z "$REPO_URL" ]; then
  echo "ERROR: REPO_URL فارغ. عدّل السطر 7 في هذا الملف وأضف رابط المستودع."
  exit 1
fi
git clone "$REPO_URL" "$DIR"

# ─── 3. Create .env ───
echo ">>> Creating .env file..."
cat > "$DIR/.env" <<ENV
VITE_SUPABASE_PROJECT_ID="iisyyazgugvmehzrpyfr"
VITE_SUPABASE_URL="https://iisyyazgugvmehzrpyfr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc3l5YXpndWd2bWVoenJweWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjEwMDYsImV4cCI6MjA4NDA5NzAwNn0.UfdMljksbxu772rcltgZpWZuGNd0RBky9qNycd2kNMo"
ENV

# ─── 4. Install npm dependencies & build ───
echo ">>> Installing npm dependencies..."
cd "$DIR"
npm install

echo ">>> Building frontend..."
npm run build

# ─── 5. Nginx config ───
echo ">>> Configuring Nginx for $DOMAIN..."
cat > /etc/nginx/sites-available/matrxe <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $DIR/dist;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
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

# ─── 6. SSL certificate ───
echo ">>> Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo ">>> Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# ─── 7. Firewall ───
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

echo ""
echo "=========================================="
echo "  ✅ https://$DOMAIN"
echo "=========================================="
echo ""
echo "═══════════════════════════════════════════════"
echo "  الخطوة التالية: نشر Supabase Edge Functions"
echo "═══════════════════════════════════════════════"
echo ""
echo "  الطريقة 1 — عبر Supabase Dashboard (يدوي):"
echo "    1. افتح https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr"
echo "    2. اذهب إلى Edge Functions → أنشئ كل function والصق الكود من:"
for func in "$DIR"/supabase/functions/*/; do
  name=$(basename "$func")
  echo "       - $name  ←  $func/index.ts"
done
echo "    3. اذهب إلى Project Settings → API → Service Role Key"
echo "       وانسخه واستخدمه في متغير SUPABASE_SERVICE_ROLE_KEY"
echo "    4. اذهب إلى Edge Functions → [أي function] → Secrets"
echo "       وأضف هذه الأسرار:"
echo "       - DEEPSEEK_API_KEY = <مفتاحك الخاص>"
echo "       - ELEVENLABS_API_KEY = <مفتاح ElevenLabs الخاص بك>"
echo "       - API_KEY_ENCRYPTION_KEY = <مفتاح تشفير قوي>"
echo "       - CONTACT_PHONE = <رقم هاتفك>"
echo ""
echo "  الطريقة 2 — عبر Supabase CLI (أسرع):"
echo "    npm install -g supabase"
echo "    supabase login"
echo "    cd $DIR"
echo "    supabase link --project-ref iisyyazgugvmehzrpyfr"
echo "    supabase db push"
echo "    supabase secrets set DEEPSEEK_API_KEY=... ..."
echo "    supabase functions deploy --project-ref iisyyazgugvmehzrpyfr --no-verify-jwt \\"
for func in "$DIR"/supabase/functions/*/; do
  name=$(basename "$func")
  echo "      $name \\"
done
echo ""
echo "═══════════════════════════════════════════════"
echo "  إعدادات Supabase Dashboard المطلوبة يدوياً:"
echo "═══════════════════════════════════════════════"
echo ""
echo "  1. Auth → Settings → Site URL: https://$DOMAIN"
echo "     Redirect URLs: https://$DOMAIN/**"
echo "  2. Auth → Providers → Google: فعّل وأضف Client ID + Secret"
echo "     (أنشئهم من Google Cloud Console)"
echo "  3. Auth → Providers → Magic Link: فعّل (مجاني، يعمل مع أي بريد)"
echo "  4. Storage → buckets → twin-images: تأكد من وجوده"
echo "  5. SQL Editor: شغّل جميع ملفات SQL من supabase/migrations/ بالترتيب"
echo ""
