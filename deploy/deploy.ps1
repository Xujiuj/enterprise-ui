param(
    [string] $EnvFile = (Join-Path $PSScriptRoot ".env"),
    [switch] $SkipBuild
)

$ErrorActionPreference = "Stop"
$ComposeFile = Join-Path $PSScriptRoot "docker-compose.yml"

if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Missing env file: $EnvFile. Copy deploy\.env.example to deploy\.env and configure it first."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Missing required command: docker"
}

if (-not $SkipBuild) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "build-image.ps1") -EnvFile $EnvFile
    if ($LASTEXITCODE -ne 0) { throw "build-image.ps1 failed" }
}

Write-Host "==> Starting enterprise UI" -ForegroundColor Cyan
docker compose --env-file $EnvFile -f $ComposeFile up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

docker compose --env-file $EnvFile -f $ComposeFile ps
Write-Host "Enterprise UI deployment complete."
