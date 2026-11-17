param(
    [int]$Port = 3001,
    [int]$ApiPort = 5048
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootDir = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $rootDir "frontend"
$logsDir = Join-Path $rootDir "logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }
$logFile = Join-Path $logsDir "frontend.log"

Set-Location $frontendDir
$env:VITE_PORT = "$Port"
$env:VITE_API_PORT = "$ApiPort"
$env:CI = "true"

# Ensure production dist exists for blazing fast tablet / LAN access
$distDir = Join-Path $frontendDir "dist"
if (-not (Test-Path $distDir)) {
    cmd.exe /c "npm run build"
}

# Auto-restart daemon loop: serves production bundle (380KB total, loads in < 0.3s on tablets)
while ($true) {
    cmd.exe /c "npx vite preview --host 0.0.0.0 --port $Port <nul > `"$logFile`" 2>&1"
    Start-Sleep -Seconds 2
}
