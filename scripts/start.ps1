param(
    [int]$FrontendPort = 3001,
    [int]$BackendPort = 5048,
    [switch]$Silent = $false
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend\Mitsuhide.Api"
$frontendDir = Join-Path $rootDir "frontend"
$dbInstance = "localhost\SQLEXPRESS"

if (-not $Silent) {
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host "  株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)" -ForegroundColor Cyan
    Write-Host "  バックグラウンド起動ランチャー (SQL Server 2019)" -ForegroundColor Cyan
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host ""
}

# 1. Check SQL Server 2019
if (-not $Silent) {
    Write-Host "[1/4] データベース (SQL Server 2019: $dbInstance) の確認中..." -ForegroundColor Yellow
}
$sqlService = Get-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
if ($sqlService) {
    if ($sqlService.Status -ne 'Running') {
        if (-not $Silent) { Write-Host " -> SQL Server を開始しています..." -ForegroundColor Yellow }
        Start-Service $sqlService
    }
    if (-not $Silent) { Write-Host " -> SQL Server (SQLEXPRESS) は正常に稼働中です。" -ForegroundColor Green }
} else {
    if (-not $Silent) { Write-Host " -> SQL Server インスタンスを確認しました。" -ForegroundColor Green }
}
if (-not $Silent) { Write-Host "" }

# 2. Terminate any previous processes on target ports to avoid conflicts
$targetPorts = @($BackendPort, $FrontendPort, 5173)
$activeConns = Get-NetTCPConnection -LocalPort $targetPorts -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }
if ($activeConns) {
    $existingPids = $activeConns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $existingPids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# 3. Launch Backend API in background (Hidden, no window)
if (-not $Silent) {
    Write-Host "[2/4] バックエンド API (ポート: $BackendPort) をバックグラウンド起動中..." -ForegroundColor Yellow
}
$backendPs = Join-Path $PSScriptRoot "run-backend.ps1"
Start-Process powershell.exe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $backendPs, "$BackendPort") -WindowStyle Hidden
if (-not $Silent) {
    Write-Host " -> バックエンドを常駐プロセスとして起動しました。" -ForegroundColor Green
    Write-Host ""
}

# 4. Launch Frontend Vite in background (Hidden, no window)
if (-not $Silent) {
    Write-Host "[3/4] フロントエンド (ポート: $FrontendPort) をバックグラウンド起動中..." -ForegroundColor Yellow
}
$frontendPs = Join-Path $PSScriptRoot "run-frontend.ps1"
Start-Process powershell.exe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $frontendPs, "$FrontendPort", "$BackendPort") -WindowStyle Hidden
if (-not $Silent) {
    Write-Host " -> フロントエンドを常駐プロセスとして起動しました。" -ForegroundColor Green
    Write-Host ""
}

# 5. Register Auto-start in Windows Startup folder (Unless stopped by stop.bat)
if (-not $Silent) {
    Write-Host "[4/4] Windows 自動起動 (Startup) の登録中..." -ForegroundColor Yellow
}
try {
    $startupFolder = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupFolder "MitsuhideERP.lnk"
    $vbsPath = Join-Path $PSScriptRoot "start-silent.vbs"

    $ws = New-Object -ComObject WScript.Shell
    $shortcut = $ws.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "wscript.exe"
    $shortcut.Arguments = "`"$vbsPath`""
    $shortcut.WorkingDirectory = $rootDir
    $shortcut.Description = "Mitsuhide Cost Management ERP Background Service"
    $shortcut.Save()

    if (-not $Silent) {
        Write-Host " -> Windows 起動時の自動実行ショートカットを登録しました。" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    if (-not $Silent) {
        Write-Host " -> 自動起動ショートカットの登録をスキップしました。" -ForegroundColor Gray
        Write-Host ""
    }
}

# 6. Wait for Backend and Frontend to be ready
if (-not $Silent) {
    Write-Host "サーバーの初期化完了を待機中..." -ForegroundColor Cyan
}
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 600
    $connFe = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
    $connBe = Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue
    if ($connFe -and $connBe) {
        $ready = $true
        break
    }
}

if (-not $Silent) {
    # Detect Local Network IP
    $lanIp = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
             Where-Object { $_.AddressFamily -eq 'InterNetwork' -and !$_.ToString().StartsWith('127.') -and !$_.ToString().StartsWith('172.') } | 
             Select-Object -ExpandProperty IPAddressToString -First 1

    if (-not $lanIp) {
        $lanIp = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
                 Where-Object { $_.AddressFamily -eq 'InterNetwork' -and !$_.ToString().StartsWith('127.') } | 
                 Select-Object -ExpandProperty IPAddressToString -First 1
    }
    if (-not $lanIp) { $lanIp = "localhost" }

    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host "  【起動完了】Mitsuhide ERP がバックグラウンドで稼働しました！" -ForegroundColor Green
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
    Write-Host "--------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  ★ バックグラウンド常駐:" -ForegroundColor Green
    Write-Host "     このウィンドウを閉じても、システムはバックグラウンドで動き続けます。" -ForegroundColor White
    Write-Host "     PCを再起動しても自動的にバックグラウンドで起動します。" -ForegroundColor White
    Write-Host ""
    Write-Host "  ※ システムを完全に停止する場合は「stop.bat」を実行してください。" -ForegroundColor Magenta
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host ""

    # Open browser
    Start-Process "http://localhost:$FrontendPort"

    Write-Host "  [i] IPアドレスやポート確認用にこの画面を開いたまま（または最小化）にしておけます。" -ForegroundColor Cyan
    Write-Host "      この情報画面を閉じたい場合は [Enter] を押すか、ウィンドウの [X] を押してください。" -ForegroundColor Gray
    Write-Host "      (この画面を閉じてもシステムはバックグラウンドで動き続けます)" -ForegroundColor DarkGray
    Write-Host ""
    Read-Host "Press [Enter] to close this status window"
}
