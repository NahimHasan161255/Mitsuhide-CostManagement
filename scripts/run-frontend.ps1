param(
    [int]$Port = 3001,
    [int]$ApiPort = 5048
)
$Host.UI.RawUI.WindowTitle = "Mitsuhide Frontend (Port $Port)"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path (Split-Path -Parent $scriptDir) "frontend"
Set-Location $frontendDir
$env:VITE_PORT = $Port
$env:VITE_API_PORT = $ApiPort

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Mitsuhide Frontend (Port: $Port)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

npx vite --host 0.0.0.0 --port $Port
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Frontend exited with code $LASTEXITCODE." -ForegroundColor Red
}
