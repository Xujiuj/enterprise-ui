#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${FX_DEPLOY_HOST:-124.221.155.102}"
SSH_USER="${FX_DEPLOY_USER:-ubuntu}"
PASSWORD="${FX_DEPLOY_PASSWORD:-Test0000}"
REMOTE_DEST="${FX_ENTERPRISE_UI_DEST:-/opt/fx/www/enterprise}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_DIST="$REPO_ROOT/dist"
REMOTE_TMP="/tmp/enterprise-ui-dist"

if [[ ! -d "$LOCAL_DIST" ]]; then
  echo "dist directory not found. Run npm run build:prod first: $LOCAL_DIST" >&2
  exit 1
fi

SSH=(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10)
SCP=(scp -o StrictHostKeyChecking=no -o ConnectTimeout=30)
if command -v sshpass >/dev/null 2>&1; then
  SSH=(sshpass -p "$PASSWORD" "${SSH[@]}")
  SCP=(sshpass -p "$PASSWORD" "${SCP[@]}")
fi

TARGET="$SSH_USER@$SERVER_HOST"
"${SSH[@]}" "$TARGET" "rm -rf '$REMOTE_TMP' && mkdir -p '$REMOTE_TMP'"
"${SCP[@]}" -r "$LOCAL_DIST"/* "$TARGET:$REMOTE_TMP/"
"${SSH[@]}" "$TARGET" "echo '$PASSWORD' | sudo -S rm -rf '$REMOTE_DEST'/* && echo '$PASSWORD' | sudo -S cp -r '$REMOTE_TMP'/* '$REMOTE_DEST'/ && echo '$PASSWORD' | sudo -S chown -R www-data:www-data '$REMOTE_DEST'/ && rm -rf '$REMOTE_TMP'"
echo "Enterprise UI deployed."
