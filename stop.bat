@echo off
chcp 65001 >nul
title Mitsuhide ERP - Stop Services

echo ==============================================================
echo   株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)
echo   システム停止スクリプト
echo ==============================================================
echo.

REM --- Stop Frontend and Backend by Port ---
echo フロントエンド (Port 5173) およびバックエンド (Port 5048) プロセスを停止中...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5048,5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
echo -> アプリケーションプロセスを正常に終了しました。
echo.

echo ==============================================================
echo   【停止完了】すべてのサービスが安全に終了しました。
echo   再度起動する場合は「start.bat」を実行してください。
echo ==============================================================
echo.
timeout /t 3 >nul
