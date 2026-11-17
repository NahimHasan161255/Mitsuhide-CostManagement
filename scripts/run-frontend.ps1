param(
    [int]$Port = 3001,
    [int]$ApiPort = 5048
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootDir = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $rootDir "frontend"

Set-Location $frontendDir
$Host.UI.RawUI.WindowTitle = "Mitsuhide Frontend (Port $Port)"
$env:VITE_PORT = "$Port"
$env:VITE_API_PORT = "$ApiPort"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  株式会社ミツヒデ 原価管理システム - Frontend" -ForegroundColor Cyan
Write-Host "  ポート: $Port  |  API 接続先: http://localhost:$ApiPort" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

npm run dev -- --host 0.0.0.0 --port $Port
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Frontend exited with code $LASTEXITCODE." -ForegroundColor Red
    Write-Host "Press any key to close this window..."
    [Console]::ReadKey($true) | Out-Null
}
