[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  株式会社ミツヒデ 原価管理システム (Mitsuhide ERP)" -ForegroundColor Cyan
Write-Host "  システム停止スクリプト (Stop Services & Unregister Autostart)" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kill processes on target ports (5048 backend, 3001 frontend, 5173 vite)
Write-Host "[1/3] アプリケーションポート (5048, 3001, 5173) のプロセスを終了中..." -ForegroundColor Yellow
$ports = @(5048, 3001, 5173)
$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }
$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
    foreach ($procId in $pids) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host " -> ポート使用プロセス (PID: $procId) を停止しました。" -ForegroundColor Green
        } catch {}
    }
} else {
    Write-Host " -> 稼働中のポートプロセスはありません。" -ForegroundColor Gray
}

# 2. Kill any Mitsuhide background processes
Write-Host "[2/3] Mitsuhide 関連のバックグラウンドプロセスを確認中..." -ForegroundColor Yellow
$currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
$mitsuhideProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    ($_.CommandLine -like "*Mitsuhide.Api*" -or $_.CommandLine -like "*Mitsuhide-CostManagement*" -or $_.CommandLine -like "*run-frontend*" -or $_.CommandLine -like "*run-backend*") -and
    $_.ProcessId -ne $currentPid -and
    $_.Name -notin @('cmd.exe', 'conhost.exe')
}

if ($mitsuhideProcesses) {
    foreach ($p in $mitsuhideProcesses) {
        try {
            Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host " -> プロセス $($p.Name) (PID: $($p.ProcessId)) を強制終了しました。" -ForegroundColor Green
        } catch {}
    }
} else {
    Write-Host " -> 関連バックグラウンドプロセスはありません。" -ForegroundColor Gray
}

# 3. Automatically remove Windows Startup shortcut
Write-Host "[3/3] Windows Startup 自動起動ショートカットの解除中..." -ForegroundColor Yellow
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "MitsuhideERP.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force -ErrorAction SilentlyContinue
    Write-Host " -> Windows Startup フォルダから「MitsuhideERP.lnk」を削除しました。" -ForegroundColor Green
} else {
    Write-Host " -> Startup フォルダに自動起動ショートカットはありません。" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  【停止完了】すべてのサービスが停止し、自動起動を解除しました。" -ForegroundColor Green
Write-Host "  次回 PC 起動時も自動実行はされません。" -ForegroundColor White
Write-Host "  再度起動する場合は「start.bat」をダブルクリックしてください。" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 2
