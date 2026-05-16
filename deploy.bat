@echo off
title MATRXe Deployment Tool
cd /d "%~dp0"
echo ========================================
echo    MATRXe - Digital Twin Deployment
echo ========================================
echo.

:: Check PowerShell
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell not found.
    pause
    exit /b 1
)

:: Run the PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*

if %errorlevel% neq 0 (
    echo.
    echo [FAILED] Deployment encountered errors.
) else (
    echo.
    echo [SUCCESS] Deployment completed.
)

pause
