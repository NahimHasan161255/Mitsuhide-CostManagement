param(
    [int]$FrontendPort = 3001,
    [int]$BackendPort = 5048
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend\Mitsuhide.Api"
$frontendDir = Join-Path $rootDir "frontend"
$dbInstance = "localhost\SQLEXPRESS"

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)" -ForegroundColor Cyan
Write-Host "  システム一括起動スクリプト (Microsoft SQL Server 2019)" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check SQL Server
Write-Host "[1/3] データベース (SQL Server 2019: $dbInstance) の確認中..." -ForegroundColor Yellow
$sqlService = Get-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
if ($sqlService) {
    if ($sqlService.Status -ne 'Running') {
        Write-Host " -> SQL Server を開始しています..." -ForegroundColor Yellow
        Start-Service $sqlService
    }
    Write-Host " -> SQL Server (SQLEXPRESS) は正常に稼働中です。" -ForegroundColor Green
} else {
    Write-Host " -> SQL Server インスタンスを確認しました。" -ForegroundColor Green
}
Write-Host ""

# 2. Detect Local Network IP
$lanIp = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
         Where-Object { $_.AddressFamily -eq 'InterNetwork' -and !$_.ToString().StartsWith('127.') -and !$_.ToString().StartsWith('172.') } | 
         Select-Object -ExpandProperty IPAddressToString -First 1

if (-not $lanIp) {
    $lanIp = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
             Where-Object { $_.AddressFamily -eq 'InterNetwork' -and !$_.ToString().StartsWith('127.') } | 
             Select-Object -ExpandProperty IPAddressToString -First 1
}
if (-not $lanIp) { $lanIp = "localhost" }

# 3. Launch Backend API
Write-Host "[2/3] バックエンド API (ポート: $BackendPort) を起動中..." -ForegroundColor Yellow
$backendPs = Join-Path $PSScriptRoot "run-backend.ps1"
Start-Process powershell.exe -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $backendPs, "$BackendPort")
Write-Host " -> バックエンドウィンドウを起動しました。" -ForegroundColor Green
Write-Host ""

# 4. Launch Frontend Vite Server
Write-Host "[3/3] フロントエンド (ポート: $FrontendPort) を起動中..." -ForegroundColor Yellow
$frontendPs = Join-Path $PSScriptRoot "run-frontend.ps1"
Start-Process powershell.exe -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $frontendPs, "$FrontendPort", "$BackendPort")
Write-Host " -> フロントエンドウィンドウを起動しました。" -ForegroundColor Green
Write-Host ""

# 5. Wait for Frontend to be ready
Write-Host "フロントエンドの初期化完了を待機中..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Milliseconds 800
    $conn = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $ready = $true
        break
    }
}

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  【起動完了】株式会社ミツヒデ 原価管理システムが稼働しました！" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ◆ このPCから利用する場合 (Local):" -ForegroundColor White
Write-Host "     -> http://localhost:$FrontendPort" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ◆ 同一ネットワーク（Wi-Fi / LAN）の別端末から利用する場合:" -ForegroundColor White
Write-Host "     -> http://${lanIp}:$FrontendPort" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ◆ バックエンド API Swagger (開発・検証用):" -ForegroundColor White
Write-Host "     -> http://localhost:$BackendPort/swagger" -ForegroundColor Gray
Write-Host ""
Write-Host "  ※ 停止する場合は「stop.bat」をダブルクリックしてください。" -ForegroundColor Magenta
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# Open browser once ready
Start-Process "http://localhost:$FrontendPort"
Start-Sleep -Seconds 2
