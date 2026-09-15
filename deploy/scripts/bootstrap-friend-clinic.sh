#!/usr/bin/env bash
# First-time setup on a fresh Hetzner Ubuntu box (no domain required).
# Run as root on the server:
#   bash deploy/scripts/bootstrap-friend-clinic.sh
#
# Or from your laptop (code rsync'd to /opt/mosmo first):
#   ssh root@SERVER_IP 'bash -s' < deploy/scripts/bootstrap-friend-clinic.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mosmo}"
ENV_FILE="${ENV_FILE:-deploy/env/friend-clinic.env}"
COMPOSE_FILE="deploy/docker-compose.bootstrap.yml"
REPO_URL="${REPO_URL:-https://github.com/BugattiBoyx/mycliniceu.git}"

export DEBIAN_FRONTEND=noninteractive

if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl git ufw fail2ban
  curl -fsSL https://get.docker.com | sh
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw --force enable
fi

if [ ! -d "$APP_DIR/.git" ] && [ ! -f "$APP_DIR/package.json" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  cp deploy/env/friend-clinic.env.example "$ENV_FILE"
  PW="$(openssl rand -base64 24 | tr -d '\n=/+' | head -c 32)"
  AUTH="$(openssl rand -base64 48 | tr -d '\n')"
  IP="$(curl -4 -fsS ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
  sed -i "s|CHANGE_ME_LONG_RANDOM|$PW|g" "$ENV_FILE"
  sed -i "s|CHANGE_ME_AUTH_SECRET|$AUTH|g" "$ENV_FILE"
  sed -i "s|SERVER_IP|$IP|g" "$ENV_FILE"
  echo ""
  echo "Created $ENV_FILE"
  echo "Edit ADMIN_EMAIL and ADMIN_PASSWORD, then re-run this script:"
  echo "  nano $APP_DIR/$ENV_FILE"
  echo ""
  if ! grep -q "CHANGE_ME_MIN_8_CHARS" "$ENV_FILE"; then
    : # password already set
  else
    exit 0
  fi
fi

if grep -q "CHANGE_ME_MIN_8_CHARS" "$ENV_FILE"; then
  echo "Set ADMIN_PASSWORD in $ENV_FILE (min 8 chars) before continuing."
  exit 1
fi

echo "Building Clinic (bootstrap / IP mode)…"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo "Seeding catalog + admin…"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile setup run --rm seed

IP="$(grep '^STOREFRONT_IP=' "$ENV_FILE" | cut -d= -f2)"
echo ""
echo "Done — same My Clinic theme, no domain needed yet."
echo "  Shop:   http://${IP}/"
echo "  Admin:  http://${IP}/admin"
echo "  Health: http://${IP}/api/health"
echo ""
echo "Enable Test payment mode in Admin → Payments to test checkout."
echo "When DNS is ready, switch to docker-compose.single.yml + Caddyfile.single."
