param(
    [string] $ServerHost = $(if ($env:FX_DEPLOY_HOST) { $env:FX_DEPLOY_HOST } else { "124.221.155.102" }),
    [string] $SshUser = $(if ($env:FX_DEPLOY_USER) { $env:FX_DEPLOY_USER } else { "ubuntu" }),
    [string] $Password = $(if ($env:FX_DEPLOY_PASSWORD) { $env:FX_DEPLOY_PASSWORD } else { "Test0000" }),
    [string] $RemoteDest = $(if ($env:FX_ENTERPRISE_UI_DEST) { $env:FX_ENTERPRISE_UI_DEST } else { "/opt/fx/www/enterprise" })
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$localDist = Join-Path $repoRoot "dist"
$remoteTmp = "/tmp/enterprise-ui-dist"

if (-not (Test-Path -LiteralPath $localDist)) {
    throw "dist directory not found. Run npm run build:prod first: $localDist"
}

$askpass = "$env:TEMP\ssh_askpass_enterprise_ui.bat"
Set-Content -Path $askpass -Value "@echo off`necho $Password" -Encoding ASCII
$env:SSH_ASKPASS = $askpass
$env:SSH_ASKPASS_REQUIRE = "force"
$env:DISPLAY = "localhost:0"

$sshTarget = "${SshUser}@${ServerHost}"
Write-Host "Uploading enterprise UI dist..."
& ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $sshTarget "rm -rf $remoteTmp && mkdir -p $remoteTmp" 2>&1
& scp -o StrictHostKeyChecking=no -o ConnectTimeout=30 -r "$localDist/*" "${sshTarget}:${remoteTmp}/" 2>&1
if ($LASTEXITCODE -ne 0) {
    Remove-Item -Path $askpass -ErrorAction SilentlyContinue
    throw "Upload failed with exit code $LASTEXITCODE"
}

Write-Host "Deploying enterprise UI..."
& ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $sshTarget "echo '$Password' | sudo -S rm -rf $RemoteDest/* && echo '$Password' | sudo -S cp -r $remoteTmp/* $RemoteDest/ && echo '$Password' | sudo -S chown -R www-data:www-data $RemoteDest/ && rm -rf $remoteTmp" 2>&1
Remove-Item -Path $askpass -ErrorAction SilentlyContinue
Write-Host "Enterprise UI deployed."
