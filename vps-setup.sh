#!/bin/bash
set -e

DOMAIN="matrxe.com"
EMAIL="admin@matrxe.com"
DIR="/var/www/matrxe"
OLD_DIR="/var/www/matrxe-old"
REPO_URL="https://github.com/tamemal123456-arch/matrxe.git" # Git clone بدلاً من FileZilla

# ─── Detect deployment method ───
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# ─── 0. Remove old deployment ───
echo "═══════════════════════════════════════════════"
echo "  تنظيف النظام القديم..."
echo "═══════════════════════════════════════════════"
echo ""

# 0a. Backup old directory before removing
if [ -d "$DIR" ]; then
  echo ">>> عمل نسخة احتياطية من النظام القديم..."
  rm -rf "$OLD_DIR" 2>/dev/null || true
  mv "$DIR" "$OLD_DIR"
  echo "  ✓ نُقل $DIR → $OLD_DIR (يمكنك حذفه يدوياً لاحقاً)"
fi

# 0b. Remove old Nginx config
if [ -f "/etc/nginx/sites-enabled/matrxe" ]; then
  echo ">>> إزالة إعدادات Nginx القديمة..."
  rm -f /etc/nginx/sites-enabled/matrxe
  rm -f /etc/nginx/sites-available/matrxe
  echo "  ✓ تمت إزالة إعدادات Nginx القديمة"
fi

# 0c. Stop services using port 80/443 if any
echo ">>> التحقق من المنافذ..."
for port in 80 443; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "  ⚠ المنفذ $port مستخدم من قبل PID $pid (سيتم استبداله بـ Nginx)"
  fi
done

# 0d. Clean npm cache (optional)
echo ">>> تنظيف ذاكرة npm المخبأة..."
npm cache clean --force 2>/dev/null || true
echo "  ✓ تم"

echo ""
echo ">>> الانتهاء من التنظيف. البدء في التثبيت الجديد..."
echo ""

# ─── 1. Install system dependencies ───
echo ">>> Installing system dependencies..."
apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx ufw

# ─── 1b. Install Node.js if missing ───
if ! command -v node &>/dev/null; then
  echo ">>> Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi

echo "   Node: $(node -v)"
echo "   npm: $(npm -v)"

# ─── 2. Get project files ───
echo ">>> Setting up project directory..."
mkdir -p "$DIR"

if [ -n "$REPO_URL" ]; then
  echo ">>> Cloning from repository..."
  git clone "$REPO_URL" "$DIR"
elif [ -f "$SCRIPT_DIR/package.json" ]; then
  echo ">>> Copying from uploaded files (FileZilla)..."
  rsync -a --exclude='node_modules' --exclude='.git' --exclude='.env' "$SCRIPT_DIR/" "$DIR/"
else
  echo "ERROR: لا يوجد package.json في المسار الحالي ولا REPO_URL."
  echo "       إما عيّن REPO_URL في السطر 8، أو ارسل الملفات عبر FileZilla إلى هذا المجلد."
  exit 1
fi

cd "$DIR"

# ─── 3. Create .env ───
echo ">>> Creating .env file..."
if [ -f ".env.production" ]; then
  echo ">>> Using .env.production as .env..."
  cp .env.production .env
else
  echo ">>> Creating default .env..."
  cat > .env <<ENV
VITE_SUPABASE_PROJECT_ID="iisyyazgugvmehzrpyfr"
VITE_SUPABASE_URL="https://iisyyazgugvmehzrpyfr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<ضع المفتاح من Supabase Dashboard → Settings → API → anon key>"
VITE_SENTRY_DSN=""
ENV
  echo "⚠️  افتح .env وأضف VITE_SUPABASE_PUBLISHABLE_KEY من Supabase Dashboard"
fi

# ─── 4. Install npm dependencies & build ───
echo ">>> Installing npm dependencies..."
npm install --legacy-peer-deps

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
    gzip_min_length 1000;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;
    gzip_vary on;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://iisyyazgugvmehzrpyfr.supabase.co/functions/v1/;
        proxy_set_header Host iisyyazgugvmehzrpyfr.supabase.co;
        proxy_set_header Authorization \$http_authorization;
        proxy_http_version 1.1;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(self), microphone=(self), geolocation=()" always;
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://apis.google.com https://js.stripe.com;
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
echo "═══════════════════════════════════════════════"
echo "  ✅ https://$DOMAIN"
echo "═══════════════════════════════════════════════"
echo ""
echo "═══════════════════════════════════════════════"
echo "  الخطوة التالية: نشر Supabase Edge Functions"
echo "═══════════════════════════════════════════════"
echo ""
echo "  1. افتح: https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr"
echo ""
echo "  2. شغّل الترحيلات (SQL Editor):"
echo "     - افتح SQL Editor → New Query"
echo "     - لكل ملف في supabase/migrations/ انسخ المحتوى وشغّله بالترتيب"
echo "     - ابدأ من أقدم تاريخ إلى أحدث تاريخ"
echo ""
echo "  3. أنشئ Edge Functions:"
ls -1 "$DIR/supabase/functions/" 2>/dev/null | while read func; do
  echo "     - Create Function → $func"
done
echo ""
echo "  4. أضف الأسرار (Secrets) لكل function:"
echo "     - DEEPSEEK_API_KEY = <مفتاح DeepSeek>"
echo "     - ELEVENLABS_API_KEY = <مفتاح ElevenLabs>"
echo "     - API_KEY_ENCRYPTION_KEY = <openssl rand -hex 32>"
echo "     - CONTACT_PHONE = <رقم الهاتف>"
echo "     - SUPABASE_SERVICE_ROLE_KEY = <من Project Settings → API>"
echo "     - STRIPE_SECRET_KEY = <sk_live_...>"
echo "     - STRIPE_WEBHOOK_SECRET = <whsec_...>"
echo ""
echo "  5. إعدادات Auth:"
echo "     - Site URL: https://$DOMAIN"
echo "     - Google OAuth: فعّل وأضف Client ID + Secret"
echo "     - Magic Link: فعّل"
echo ""
echo "═══════════════════════════════════════════════"
