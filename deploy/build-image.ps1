param(
    [string] $EnvFile = (Join-Path $PSScriptRoot ".env")
)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot

function Get-EnvValue {
    param([string] $Name, [string] $Default = "")
    if (Test-Path -LiteralPath $EnvFile) {
        foreach ($line in Get-Content -LiteralPath $EnvFile -Encoding UTF8) {
            $trimmed = $line.Trim()
            if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }
            $idx = $trimmed.IndexOf("=")
            if ($idx -lt 1) { continue }
            if ($trimmed.Substring(0, $idx).Trim() -eq $Name) {
                return $trimmed.Substring($idx + 1).Trim()
            }
        }
    }
    return $Default
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Missing required command: docker"
}

$registry = if ($env:REGISTRY) { $env:REGISTRY } else { Get-EnvValue "REGISTRY" "local" }
$namespace = if ($env:IMAGE_NAMESPACE) { $env:IMAGE_NAMESPACE } else { Get-EnvValue "IMAGE_NAMESPACE" "fx" }
$tag = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { Get-EnvValue "IMAGE_TAG" "latest" }
$image = "$registry/$namespace/enterprise-ui:$tag"

Write-Host "==> Building image $image" -ForegroundColor Cyan
docker build -t $image $ProjectDir
if ($LASTEXITCODE -ne 0) { throw "enterprise UI image build failed" }

Write-Host "Built $image"
