# CRYPTO-NEX PowerShell Launcher — SIH 2026
# Run: .\start_all.ps1

$Host.UI.RawUI.WindowTitle = "CRYPTO-NEX Launcher"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "   CRYPTO-NEX — Blockchain Intelligence for VASP Attribution" -ForegroundColor White
Write-Host "   SIH 2026 Full Stack Launcher" -ForegroundColor Gray
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend
Write-Host "  [1/3] Starting Backend API (port 5000)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c node dist/server.js" `
  -WorkingDirectory "$root\backend" `
  -WindowStyle Minimized `
  -PassThru

Start-Sleep -Seconds 2

# 2. Python Analytics
Write-Host "  [2/3] Starting Python Analytics (port 8000)..." -ForegroundColor Yellow
$analytics = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c python main.py" `
  -WorkingDirectory "$root\analytics" `
  -WindowStyle Minimized `
  -PassThru

Start-Sleep -Seconds 2

# 3. Frontend Dev Server
Write-Host "  [3/3] Starting Frontend Dev Server (port 5173)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c npx.cmd vite --port 5173 --host 127.0.0.1" `
  -WorkingDirectory "$root\frontend" `
  -WindowStyle Minimized `
  -PassThru

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Green
Write-Host "   ALL SERVICES RUNNING" -ForegroundColor Green
Write-Host "  ============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "    Dashboard  : http://localhost:5173" -ForegroundColor Cyan
Write-Host "    Backend API: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "    Analytics  : http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "   CLI Commands:" -ForegroundColor White
Write-Host "    node cli.js analyze 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" -ForegroundColor Gray
Write-Host "    node cli.js presets" -ForegroundColor Gray
Write-Host "    node cli.js live 0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE" -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Process "http://localhost:5173"

Write-Host "  Press ENTER to stop all services..." -ForegroundColor Yellow
Read-Host | Out-Null

# Cleanup
Write-Host "  Stopping services..." -ForegroundColor Red
if ($backend)   { Stop-Process -Id $backend.Id   -Force -ErrorAction SilentlyContinue }
if ($analytics) { Stop-Process -Id $analytics.Id -Force -ErrorAction SilentlyContinue }
if ($frontend)  { Stop-Process -Id $frontend.Id  -Force -ErrorAction SilentlyContinue }
Write-Host "  Done." -ForegroundColor Green
