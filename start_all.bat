@echo off
title CRYPTO-NEX — SIH 2026 Full Stack Launcher
color 0B

echo.
echo  ============================================================
echo   CRYPTO-NEX - Blockchain Intelligence for VASP Attribution
echo   SIH 2026 Full Stack Deployment
echo  ============================================================
echo.

cd /d "%~dp0"

echo  [1/3] Starting Backend API (port 5000)...
cd backend
start "CRYPTO-NEX Backend :5000" /min cmd /c "node dist/server.js"
cd ..
timeout /t 2 /nobreak > nul

echo  [2/3] Starting Python Analytics Engine (port 8000)...
cd analytics
start "CRYPTO-NEX Analytics :8000" /min cmd /c "python main.py"
cd ..
timeout /t 2 /nobreak > nul

echo  [3/3] Starting Frontend Dev Server (port 5173)...
cd frontend
start "CRYPTO-NEX Frontend :5173" /min cmd /c "npx.cmd vite --port 5173 --host 127.0.0.1"
cd ..
timeout /t 4 /nobreak > nul

echo.
echo  ============================================================
echo   ALL SERVICES RUNNING
echo  ============================================================
echo.
echo    Dashboard:  http://localhost:5173
echo    Backend API: http://localhost:5000/health
echo    Analytics:  http://localhost:8000/health
echo.
echo    CLI Usage:
echo      node cli.js analyze 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
echo      node cli.js presets
echo      node cli.js report ^<address^>
echo      node cli.js live ^<address^>
echo.
echo  Opening dashboard in browser...
timeout /t 1 /nobreak > nul
start http://localhost:5173

echo.
echo  Press any key to stop all services...
pause > nul

echo  Stopping services...
taskkill /fi "WindowTitle eq CRYPTO-NEX Backend :5000" /f > nul 2>&1
taskkill /fi "WindowTitle eq CRYPTO-NEX Analytics :8000" /f > nul 2>&1
taskkill /fi "WindowTitle eq CRYPTO-NEX Frontend :5173" /f > nul 2>&1
echo  Done.
