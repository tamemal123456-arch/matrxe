param(
  [string]$BackupDir = ".\backups",
  [switch]$UploadToStorage,
  [switch]$Help
)

if ($Help) {
  Write-Host @"
MATRXe Backup Script
====================

Usage:
  .\scripts\backup.ps1                     # Local backup only
  .\scripts\backup.ps1 -UploadToStorage    # Backup + upload to Supabase Storage
  .\scripts\backup.ps1 -BackupDir "D:\backups"  # Custom directory

Requires:
  - supabase CLI installed and linked
  - SUPABASE_SERVICE_ROLE_KEY in environment
"@
  exit 0
}

$ErrorActionPreference = "Stop"
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
$projectRef = "iisyyazgugvmehzrpyfr"
$backupPath = Join-Path $BackupDir $date
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

Write-Host ">>> Starting backup of project $projectRef to $backupPath" -ForegroundColor Cyan

# 1. Database schema
Write-Host ">>> Exporting database schema..." -ForegroundColor Cyan
& supabase db dump --project-ref $projectRef --schema public > "$backupPath\Schema.sql" 2>$null
if ($?) { Write-Host "  OK  Schema exported" -ForegroundColor Green }
else { Write-Host "  FAIL Schema export" -ForegroundColor Red }

# 2. Database data
Write-Host ">>> Exporting database data..." -ForegroundColor Cyan
& supabase db dump --project-ref $projectRef --data-only > "$backupPath\Data.sql" 2>$null
if ($?) { Write-Host "  OK  Data exported" -ForegroundColor Green }
else { Write-Host "  FAIL Data export" -ForegroundColor Red }

# 3. Environment file backup
if (Test-Path ".env") {
  Copy-Item ".env" "$backupPath\.env.backup"
  Write-Host "  OK  .env backed up" -ForegroundColor Green
}

# 4. Git bundle (full repo backup)
Write-Host ">>> Creating git bundle..." -ForegroundColor Cyan
git bundle create "$backupPath\repository.bundle" --all 2>$null
if ($?) { Write-Host "  OK  Git bundle created" -ForegroundColor Green }
else { Write-Host "  SKIP No git repo" -ForegroundColor Yellow }

# 5. Compress backup
Write-Host ">>> Compressing backup..." -ForegroundColor Cyan
Compress-Archive -Path "$backupPath\*" -DestinationPath "$backupPath.zip" -Force
Remove-Item -Recurse -Force "$backupPath" -ErrorAction SilentlyContinue
Write-Host "  OK  Backup compressed: $backupPath.zip" -ForegroundColor Green

# 6. Upload to Supabase Storage
if ($UploadToStorage) {
  Write-Host ">>> Uploading to Supabase Storage..." -ForegroundColor Cyan
  $anonKey = $env:VITE_SUPABASE_PUBLISHABLE_KEY
  $supaUrl = $env:VITE_SUPABASE_URL
  if ($anonKey -and $supaUrl) {
    $fileName = "backups/$date.zip"
    $fileBytes = [System.IO.File]::ReadAllBytes("$backupPath.zip")
    $headers = @{ apikey = $anonKey; Authorization = "Bearer $anonKey"; "Content-Type" = "application/zip" }
    Invoke-RestMethod -Uri "$supaUrl/storage/v1/object/twin-images/$fileName" -Method Post -Headers $headers -Body $fileBytes -ErrorAction SilentlyContinue
    if ($?) { Write-Host "  OK  Uploaded to Storage" -ForegroundColor Green }
    else { Write-Host "  FAIL Upload to Storage" -ForegroundColor Red }
  } else {
    Write-Host "  SKIP Missing Supabase credentials" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "=== Backup complete: $backupPath.zip ===" -ForegroundColor Cyan
Write-Host "Size: $((Get-Item "$backupPath.zip").Length / 1MB) MB" -ForegroundColor Cyan
