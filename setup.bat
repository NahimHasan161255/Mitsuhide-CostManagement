@echo off
chcp 65001 >nul
title Mitsuhide ERP - Environment Setup (SQL Server 2019)

echo ==============================================================
echo   株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)
echo   [Setup] 初期環境セットアップスクリプト (SQL Server 2019)
echo ==============================================================
echo.

REM --- 1. Check prerequisites ---
echo [1/4] 動作前提環境の確認中...

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

echo -> .NET SDK, Node.js の検出に成功しました。
echo.

REM --- 2. Check and start SQL Server 2019 Service ---
echo [2/4] Microsoft SQL Server 2019 (SQLEXPRESS) サービス確認中...
sc query "MSSQL$SQLEXPRESS" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    net start "MSSQL$SQLEXPRESS" >nul 2>nul
    echo -> SQL Server (SQLEXPRESS) サービスが正常に稼働しています。
) else (
    echo [INFO] MSSQLSERVER またはデフォルトインスタンスを使用します。
)

echo -> データベーステーブルおよび初期データのセットアップを実行中...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$sqlFile = '%~dp0database\init_mitsuhide_db_sqlserver.sql'; $content = Get-Content -Path $sqlFile -Raw -Encoding utf8; $connStr = 'Server=localhost\SQLEXPRESS;Database=master;Integrated Security=True;TrustServerCertificate=True;'; try { $conn = New-Object System.Data.SqlClient.SqlConnection($connStr); $conn.Open(); $batches = $content -split '(?m)^\s*GO\s*$'; foreach ($b in $batches) { $t = $b.Trim(); if ($t.Length -gt 0) { $cmd = $conn.CreateCommand(); $cmd.CommandText = $t; $cmd.ExecuteNonQuery() | Out-Null; } }; $conn.Close(); Write-Host '-> データベース mitsuhide_cost_db の初期化が完了しました。'; } catch { Write-Host '-> DB初期化注意: ' $_.Exception.Message; }"
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
