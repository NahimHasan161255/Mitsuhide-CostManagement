param([int]$Port = 5048)
$Host.UI.RawUI.WindowTitle = "Mitsuhide Backend API (Port $Port)"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path (Split-Path -Parent $scriptDir) "backend\Mitsuhide.Api"
Set-Location $backendDir
$env:ASPNETCORE_ENVIRONMENT = "Development"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Mitsuhide Backend API (Port: $Port)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

dotnet run --no-build --urls "http://0.0.0.0:$Port"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Backend exited with code $LASTEXITCODE." -ForegroundColor Red
}
