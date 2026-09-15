#!/usr/bin/env bash
# Push local code to the friend's Hetzner box and rebuild (from your Mac).
#
# Usage:
#   ./deploy/scripts/deploy-friend-clinic.sh root@SERVER_IP
#   ./deploy/scripts/deploy-friend-clinic.sh root@SERVER_IP ~/.ssh/id_ed25519
#
# First deploy on an empty server:
#   ./deploy/scripts/deploy-friend-clinic.sh root@SERVER_IP
#   ssh root@SERVER_IP 'cd /opt/mosmo && bash deploy/scripts/bootstrap-friend-clinic.sh'

set -euo pipefail

HOST="${1:?Usage: $0 root@SERVER_IP [ssh-key-path]}"
SSH_KEY="${2:-$HOME/.ssh/id_ed25519}"
APP_DIR="/opt/mosmo"
ENV_FILE="deploy/env/friend-clinic.env"
COMPOSE_FILE="deploy/docker-compose.bootstrap.yml"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

RSYNC_SSH="ssh -i $SSH_KEY -o IdentitiesOnly=yes"

echo "→ Syncing code to $HOST:$APP_DIR …"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude clone --exclude site --exclude mirror --exclude .peekaboo \
  --exclude 'deploy/env/*.env' \
  --exclude deploy/backups \
  -e "$RSYNC_SSH" \
  "$ROOT/" "$HOST:$APP_DIR/"

echo "→ Rebuilding app…"
$RSYNC_SSH "$HOST" "cd $APP_DIR && docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build app"

echo "→ Done. Hard-refresh http://<server-ip>/ in the browser."
