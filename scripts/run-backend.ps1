param([int]$Port = 5048)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend\Mitsuhide.Api"

Set-Location $backendDir
$Host.UI.RawUI.WindowTitle = "Mitsuhide Backend API (Port $Port)"
$env:ASPNETCORE_ENVIRONMENT = "Development"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  株式会社ミツヒデ 原価管理システム - Backend API" -ForegroundColor Cyan
Write-Host "  ポート: $Port  |  環境: Development" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

dotnet run --urls "http://0.0.0.0:$Port"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Backend API exited with code $LASTEXITCODE." -ForegroundColor Red
    Write-Host "Press any key to close this window..."
    [Console]::ReadKey($true) | Out-Null
}
