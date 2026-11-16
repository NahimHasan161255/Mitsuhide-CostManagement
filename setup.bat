@echo off
chcp 65001 >nul
title Mitsuhide ERP - Initial Environment Setup

echo ==============================================================
echo   株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)
echo   [Setup] 初期環境セットアップスクリプト
echo ==============================================================
echo.

REM --- 1. Check prerequisites ---
echo [1/4] 動作前提環境の確認中...

where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker がインストールされていません。Docker Desktop をインストールしてください。
    pause
    exit /b 1
)

where dotnet >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] .NET SDK がインストールされていません。.NET 10 SDK をインストールしてください。
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js がインストールされていません。Node.js (v18以上) をインストールしてください。
    pause
    exit /b 1
)

echo -> Docker, .NET, Node.js の検出に成功しました。
echo.

REM --- 2. Start MySQL Container & Check Database ---
echo [2/4] MySQL データベースコンテナの起動中...
docker compose up -d mysql
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Docker コンテナの起動に失敗しました。Docker Desktop が起動しているかご確認ください。
) else (
    echo -> MySQL コンテナが正常に稼働しています。
)
echo.

REM --- 3. Backend NuGet Restore & Build ---
echo [3/4] バックエンド (.NET Web API) パッケージ復元およびビルド中...
cd backend
dotnet restore Mitsuhide.slnx
if %ERRORLEVEL% neq 0 (
    echo [ERROR] dotnet restore に失敗しました。
    cd ..
    pause
    exit /b 1
)
dotnet build Mitsuhide.slnx -c Debug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] dotnet build に失敗しました。
    cd ..
    pause
    exit /b 1
)
cd ..
echo -> バックエンドのビルドが完了しました。
echo.

REM --- 4. Frontend npm install ---
echo [4/4] フロントエンド (React / Vite) パッケージのインストール中...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install に失敗しました。
    cd ..
    pause
    exit /b 1
)
cd ..
echo -> フロントエンドの依存パッケージ導入が完了しました。
echo.

echo ==============================================================
echo   【セットアップ完了】すべての準備が正常に整いました！
echo   次回からは「start.bat」をダブルクリックするだけで、
echo   データベース、バックエンド、フロントエンドが一度に起動します。
echo ==============================================================
echo.
pause
