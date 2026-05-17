# سكربت تعبئة مشروع MATRXe للرفع عبر FileZilla إلى VPS
$ErrorActionPreference = "Stop"
$ROOT = Get-Location
$OUTPUT = Join-Path $ROOT "matrxe-vps-upload"
$VERSION = "1.0.0"
$DATE = Get-Date -Format "yyyy-MM-dd"

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MATRXe VPS Package Builder v$VERSION     ║" -ForegroundColor Cyan
Write-Host "║   $DATE                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan

if (Test-Path $OUTPUT) {
  Remove-Item -Recurse -Force $OUTPUT
  Write-Host "> تم حذف الحزمة القديمة" -ForegroundColor Yellow
}
New-Item -ItemType Directory -Path $OUTPUT -Force | Out-Null

Write-Host "`n> نسخ ملفات المشروع..." -ForegroundColor Green

$exclude = @(
  "node_modules", ".git", "dist", ".env",
  "package-for-vps.ps1"
)

$excludeArgs = @()
foreach ($item in $exclude) {
  $excludeArgs += @("/XD", $item, "/XF", $item)
}

robocopy $ROOT $OUTPUT /S /NJH /NJS /NDL /NP $excludeArgs 2>&1 | Out-Null
Write-Host "  ✓ تم نسخ جميع الملفات"

Write-Host "`n> إنشاء .env.production..." -ForegroundColor Green
@"
VITE_SUPABASE_PROJECT_ID="iisyyazgugvmehzrpyfr"
VITE_SUPABASE_URL="https://iisyyazgugvmehzrpyfr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc3l5YXpndWd2bWVoenJweWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjEwMDYsImV4cCI6MjA4NDA5NzAwNn0.UfdMljksbxu772rcltgZpWZuGNd0RBky9qNycd2kNMo"
VITE_SENTRY_DSN=""
"@ | Set-Content "$OUTPUT\.env.production" -Encoding UTF8
Write-Host "  ✓ .env.production"

Write-Host "`n> إنشاء دليل الرفع..." -ForegroundColor Green
@"
═══════════════════════════════════════════
  MATRXe - دليل رفع المشروع عبر FileZilla
═══════════════════════════════════════════
  التاريخ: $DATE

── الخطوة 1: رفع الملفات عبر FileZilla ──

1. افتح FileZilla → File → Site Manager → New Site
2. Protocol: SFTP (SSH File Transfer Protocol)
3. Host: [عنوان IP السيرفر]
4. Port: 22
5. Logon Type: Normal
6. User: root
7. Password: [كلمة سر السيرفر]
8. Connect

9. في الجانب الأيمن (السيرفر)، اذهب إلى: /root/
10. في الجانب الأيسر (جهازك)، اذهب إلى المجلد الذي فيه الملف المضغوط
11. اسحب matrxe-vps-upload.zip إلى /root/ على السيرفر
12. انتظر انتهاء الرفع

── الخطوة 2: فك الضغط والتشغيل على السيرفر ──

بعد رفع الملف، ادخل SSH (او Terminal في FileZilla):

   cd /root
   apt install unzip -y
   unzip matrxe-vps-upload.zip
   cd matrxe-vps-upload
   chmod +x vps-setup.sh
   ./vps-setup.sh

ملاحظة: السكربت سيقوم تلقائياً بما يلي:
  • حذف النظام القديم من /var/www/matrxe ← نسخه إلى /var/www/matrxe-old
  • إزالة إعدادات Nginx القديمة
  • التحقق من المنافذ 80/443
  • تنظيف ذاكرة npm المخبأة

── الخطوة 3: بعد انتهاء السكربت ──

1. افتح: https://supabase.com/dashboard/project/iisyyazgugvmehzrpyfr
2. SQL Editor → شغّل جميع ملفات الترحيل بالترتيب
3. Edge Functions → أنشئ كل دالة والصق الكود
4. أضف الأسرار (API Keys) لكل دالة
5. فعّل Google OAuth و Magic Link في Auth Settings

── هيكل المجلدات ──

matrxe-vps-upload/
├── src/                  # كود المصدر (يُبنى على السيرفر)
├── public/               # ملفات ثابتة (PWA, sitemap, etc)
├── supabase/
│   ├── functions/        # Edge Functions (10 دوال)
│   └── migrations/       # SQL migrations (14 ملف)
├── scripts/              # سكربتات مساعدة (backup, etc)
├── .github/workflows/    # CI/CD
├── vps-setup.sh          # سكربت الإعداد الرئيسي
├── deploy-readme.txt     # هذا الملف
├── .env.production       # متغيرات البيئة
└── package.json          # اعتماديات Node.js
═══════════════════════════════════════════
"@ | Set-Content "$OUTPUT\deploy-readme.txt" -Encoding UTF8
Write-Host "  ✓ deploy-readme.txt"

Write-Host "`n> إنشاء الملف المضغوط..." -ForegroundColor Green
$zipPath = "$ROOT\matrxe-vps-upload.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($OUTPUT, $zipPath)

$size = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Remove-Item -Recurse -Force $OUTPUT

Write-Host "  ✓ matrxe-vps-upload.zip (${size} MB)" -ForegroundColor Green

Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   تم التجهيز!                           ║" -ForegroundColor Cyan
Write-Host "║                                         ║" -ForegroundColor Cyan
Write-Host "║   1. ارفع الملف عبر FileZilla            ║" -ForegroundColor Cyan
Write-Host "║   2. ادخل SSH:                          ║" -ForegroundColor Cyan
Write-Host "║      unzip matrxe-vps-upload.zip          ║" -ForegroundColor White
Write-Host "║      cd matrxe-vps-upload                ║" -ForegroundColor White
Write-Host "║      ./vps-setup.sh                      ║" -ForegroundColor White
Write-Host "║                                         ║" -ForegroundColor Cyan
Write-Host "║   حجم الملف: ${size} MB                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
