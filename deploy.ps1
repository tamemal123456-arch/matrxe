param(
  [switch]$SkipMigrations,
  [switch]$SkipFunctions,
  [switch]$SkipBuild,
  [switch]$Help
)

$ErrorActionPreference = "Stop"
$ProjectRef = "iisyyazgugvmehzrpyfr"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

function Log($msg) { Write-Host ">>> $msg" -ForegroundColor Cyan }
function Ok($msg)  { Write-Host "  OK  $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  [!] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "  FAIL $msg" -ForegroundColor Red; exit 1 }

if ($Help) {
  @"
MATRXe Deployment Script
========================
Usage: .\deploy.ps1 [options]

Options:
  -SkipMigrations    Skip database migration step
  -SkipFunctions     Skip edge function deployment
  -SkipBuild         Skip frontend build

Environment variables needed (or will be prompted):
  SUPABASE_ACCESS_TOKEN  - Supabase personal access token (for mgmt API)
  ELEVENLABS_API_KEY     - ElevenLabs API key for TTS & talking video
  CONTACT_PHONE          - Contact phone number
"@
  exit 0
}

Log "MATRXe Deployment - Project: $ProjectRef"
Log "Root: $RootDir"
Write-Host ""

# ─── 1. Prerequisites check ───
Log "Checking prerequisites..."
$hasNpx = Get-Command "npx" -ErrorAction SilentlyContinue
if (-not $hasNpx) { Fail "Node.js/npx not found. Install Node.js first." }
Ok "Node.js available"

$sbAvailable = $false
$sbCmd = Get-Command "supabase" -ErrorAction SilentlyContinue
if ($sbCmd) {
  $sbCheck = & supabase --version 2>$null
  $sbAvailable = $true
  Ok "Supabase CLI: $sbCheck"
} else {
  Warn "Supabase CLI not found — will skip CLI-only steps"
}

# ─── 2. Read .env ───
if (Test-Path ".env") {
  Log ".env file found, reading variables..."
  $envContent = Get-Content ".env"
  $anonKey = $null; $supaUrl = $null
  foreach ($line in $envContent) {
    if ($line -match '^VITE_SUPABASE_PUBLISHABLE_KEY="(.+)"$') { $anonKey = $Matches[1] }
    if ($line -match '^VITE_SUPABASE_URL="(.+)"$')            { $supaUrl = $Matches[1] }
  }
  if ($anonKey) { Ok "PUBLISHABLE_KEY found" }
  if ($supaUrl)  { Ok "SUPABASE_URL found" }
} else {
  Warn ".env not found — create it first with VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_URL"
}

# ─── 3. Collect secrets ───
Log "Collecting secrets..."
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceRoleKey) {
  Fail "SUPABASE_SERVICE_ROLE_KEY not set. Use: `$env:SUPABASE_SERVICE_ROLE_KEY = '...'"
}

$elevenLabsKey = $env:ELEVENLABS_API_KEY
if (-not $elevenLabsKey) { Warn "ELEVENLABS_API_KEY not set — TTS & talking video will use browser fallback" }

$contactPhone = $env:CONTACT_PHONE
if (-not $contactPhone) { $contactPhone = "00967779846405"; Ok "CONTACT_PHONE defaulting to $contactPhone" }
Ok "Secrets collected"

# ─── 4. Apply Migrations ───
if (-not $SkipMigrations) {
  $migrationDir = "supabase\migrations"
  $migrationFiles = @(
    "20260514120000_add_storage_and_rls.sql",
    "20260514130000_twin_memory_and_features.sql",
    "20260514140000_api_key_tiers_and_usage.sql",
    "20260515190000_twin_advanced_features.sql",
    "20260515200000_twin_offline_tasks.sql"
  )

  if ($sbAvailable) {
    Log "Applying migrations via Supabase CLI..."
    supabase db push --project-ref $ProjectRef 2>&1
    if ($?) { Ok "Migrations applied successfully" }
    else    { Warn "supabase db push failed — try manual method below" }
  } else {
    Warn "Need to apply migrations manually."
    Write-Host ""
    Write-Host "══════════════════════════════════════════════════════════════════"
    Write-Host "  Open Supabase Dashboard, go to SQL Editor, and run these SQL"
    Write-Host "  files in order. Copy each file's content entirely."
    Write-Host "══════════════════════════════════════════════════════════════════"
    Write-Host ""

    # Check for update_updated_at_column function first
    Write-Host "  FIRST ensure this function exists (run in SQL Editor):"
    Write-Host '    CREATE OR REPLACE FUNCTION public.update_updated_at_column()'
    Write-Host '    RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;'
    Write-Host ""

    foreach ($file in $migrationFiles) {
      $fullPath = Join-Path $RootDir "$migrationDir\$file"
      $lines = (Get-Content $fullPath).Count
      Write-Host "  [$file] — $lines lines"
    }
    Write-Host ""
    Write-Host "  Quick copy commands (paste each into SQL Editor in order):"
    foreach ($file in $migrationFiles) {
      $fullPath = Join-Path $RootDir "$migrationDir\$file"
      Write-Host "    Get-Content '$fullPath' -Raw | Set-Clipboard"
    }
    Write-Host ""
    Write-Host "  Also ensure this function exists (run if not already):"
    Write-Host '    CREATE OR REPLACE FUNCTION public.update_updated_at_column()'
    Write-Host '    RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;'
    Write-Host "══════════════════════════════════════════════════════════════════"
    Write-Host ""
  }
}

# ─── 5. Set Edge Function Secrets ───
if (-not $SkipFunctions) {
  Log "Setting Edge Function secrets..."
  $neededSecrets = @{}
  if ($elevenLabsKey) { $neededSecrets["ELEVENLABS_API_KEY"] = $elevenLabsKey }
  if ($contactPhone)  { $neededSecrets["CONTACT_PHONE"] = $contactPhone }
  # قم بتعيين أسرارك الخاصة (لا تضع المفاتيح في الكود المصدري)
  # $neededSecrets["DEEPSEEK_API_KEY"] = "<مفتاحك>"
  # $neededSecrets["API_KEY_ENCRYPTION_KEY"] = "<مفتاح تشفير قوي>"
  # Free AI providers (optional but recommended for more fallbacks):
  # $neededSecrets["OPENROUTER_API_KEY"] = "sk-or-..."   # Free models: google/gemini-2.5-flash, meta-llama/llama-3-70b-instruct
  # $neededSecrets["GROQ_API_KEY"] = "gsk_..."           # Free tier: Llama 3.3 70B, Mixtral 8x7B
  # $neededSecrets["GOOGLE_API_KEY"] = "AIza..."         # Google AI Studio free tier: Gemini 2.5 Flash
  # $neededSecrets["STRIPE_SECRET_KEY"] = "sk_live_..."  # Stripe secret key for subscriptions
  # $neededSecrets["STRIPE_WEBHOOK_SECRET"] = "whsec_..." # Stripe webhook signing secret

  if ($sbAvailable) {
    foreach ($secret in $neededSecrets.Keys) {
      $val = $neededSecrets[$secret]
      Log "Setting secret: $secret ..."
      supabase secrets set --project-ref $ProjectRef "${secret}=${val}" 2>&1 | Out-Null
      if ($?) { Ok "Secret set: $secret" }
      else    { Warn "Failed to set $secret" }
    }
  } else {
    Warn "Supabase CLI required for setting secrets. Set manually:"
    Write-Host "  Dashboard → Edge Functions → [any function] → Secrets → Add"
    foreach ($secret in $neededSecrets.Keys) {
      Write-Host "    - $secret"
    }
  }
}

# ─── 6. Deploy Edge Functions ───
if (-not $SkipFunctions) {
  $funcDirs = Get-ChildItem -Path "supabase\functions" -Directory
  if (-not $funcDirs) { Warn "No functions found in supabase/functions"; return }
  if ($sbAvailable) {
    foreach ($funcDir in $funcDirs) {
      $funcName = $funcDir.Name
      Log "Deploying edge function: $funcName..."
      supabase functions deploy $funcName --project-ref $ProjectRef
      if ($?) { Ok "$funcName deployed" }
      else    { Warn "$funcName failed to deploy" }
    }
  } else {
    Warn "Supabase CLI required for function deployment. Deploy manually via Dashboard."
    Write-Host "  Functions to deploy:"
    foreach ($funcDir in $funcDirs) { Write-Host "  - $($funcDir.Name)" }
  }
}

# ─── 7. Install dependencies ───
if (-not (Test-Path "node_modules\.package-lock.json")) {
  Log "Installing npm dependencies..."
  npm install
  if ($?) { Ok "Dependencies installed" }
  else    { Warn "npm install failed" }
}

# ─── 8. Build frontend ───
if (-not $SkipBuild) {
  Log "Building frontend..."
  npm run build
  if ($?) { Ok "Frontend built successfully" }
  else    { Warn "Frontend build failed" }
}

# ─── 8. Done ───
Write-Host ""
Log "Deployment complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Run 'npm run dev' for local dev server"
Write-Host "  2. Or deploy built files from dist/ to your hosting (Vercel, Netlify, etc.)"
Write-Host "  3. Test creating a twin with avatar upload"
Write-Host "  4. Test chat — no more 402 errors! Uses DeepSeek + fallback chain"
Write-Host "  5. Add more free API keys for better reliability:"
Write-Host "     supabase secrets set OPENROUTER_API_KEY=sk-or-... --project-ref $ProjectRef"
Write-Host "     supabase secrets set GROQ_API_KEY=gsk_... --project-ref $ProjectRef"
