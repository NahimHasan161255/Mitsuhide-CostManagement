@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Mitsuhide ERP - Launcher

REM ==============================================================
REM   【ポート設定】必要に応じてここでポート番号を変更できます
REM ==============================================================
SET FRONTEND_PORT=5173
SET BACKEND_PORT=5048
SET DB_PORT=3306
SET PMA_PORT=8080
REM ==============================================================

echo ==============================================================
echo   株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)
echo   システム一括起動スクリプト
echo ==============================================================
echo.

REM --- 1. Start MySQL via Docker ---
echo [1/3] データベース (MySQL 8.0) の確認・起動中...
docker compose up -d mysql
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Docker の起動に失敗した可能性があります。Docker Desktop が立ち上がっているかご確認ください。
) else (
    echo -> データベースは正常に準備完了しました。(ポート: %DB_PORT%)
)
echo.

REM --- 2. Detect Local Network (LAN) IP ---
set "LAN_IP="
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "[System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' -and !$_.ToString().StartsWith('127.') } | Select-Object -ExpandProperty IPAddressToString -First 1"`) do (
    set "LAN_IP=%%i"
)
if "%LAN_IP%"=="" set "LAN_IP=localhost"

REM --- 3. Launch Backend API ---
echo [2/3] バックエンド API (ポート: %BACKEND_PORT%) を起動中...
start "Mitsuhide Backend API (Port %BACKEND_PORT%)" cmd /c "cd /d "%~dp0backend\Mitsuhide.Api" && set ASPNETCORE_ENVIRONMENT=Development && dotnet run --no-build --urls http://0.0.0.0:%BACKEND_PORT%"
echo -> バックエンドをバックグラウンドウィンドウで起動しました。
echo.

REM --- 4. Launch Frontend Vite Server ---
echo [3/3] フロントエンド (ポート: %FRONTEND_PORT%) を起動中...
start "Mitsuhide Frontend (Port %FRONTEND_PORT%)" cmd /c "cd /d "%~dp0frontend" && set VITE_PORT=%FRONTEND_PORT% && set VITE_API_PORT=%BACKEND_PORT% && npx vite --host 0.0.0.0 --port %FRONTEND_PORT%"
echo -> フロントエンドをバックグラウンドウィンドウで起動しました。
echo.

echo ==============================================================
echo   【起動完了】株式会社ミツヒデ 原価管理システムが稼働しました！
echo ==============================================================
echo.
echo   ◆ このPCから利用する場合 (Local):
echo      -> http://localhost:%FRONTEND_PORT%
echo.
echo   ◆ 同一ネットワーク（Wi-Fi / LAN）の別PCやスマホから利用する場合:
echo      -> http://%LAN_IP%:%FRONTEND_PORT%
echo.
echo   ◆ バックエンド API Swagger (開発・検証用):
echo      -> http://localhost:%BACKEND_PORT%/swagger
echo.
echo   ◆ データベース管理 (phpMyAdmin):
echo      -> http://localhost:%PMA_PORT%
echo.
echo   ※ システムを終了する場合は「stop.bat」をダブルクリックしてください。
echo ==============================================================
echo.

REM 3秒後にブラウザで自動表示
timeout /t 3 >nul
start http://localhost:%FRONTEND_PORT%
