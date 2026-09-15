#!/usr/bin/env bash
# Run on a fresh Ubuntu Hetzner box as root:
#   curl -fsSL https://raw.githubusercontent.com/BugattiBoyx/infra/main/deploy/scripts/bootstrap-hetzner.sh | bash
# Or after cloning:
#   bash deploy/scripts/bootstrap-hetzner.sh

set -euo pipefail

REPO_URL="${REPO_URL:-git@github.com:BugattiBoyx/infra.git}"
APP_DIR="${APP_DIR:-/opt/mosmo}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git ufw fail2ban

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

# Firewall: SSH + HTTP/HTTPS only
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" pull --ff-only
fi

cd "$APP_DIR"

if [ ! -f deploy/env/single.env ]; then
  cp deploy/env/single.env.example deploy/env/single.env
  # Generate secrets
  PW="$(openssl rand -base64 24 | tr -d '\n=/+' | head -c 32)"
  AUTH="$(openssl rand -base64 48 | tr -d '\n')"
  IP="$(curl -4 -fsS ifconfig.me || hostname -I | awk '{print $1}')"
  sed -i "s|CHANGE_ME_LONG_RANDOM|$PW|" deploy/env/single.env
  sed -i "s|CHANGE_ME_AUTH_SECRET|$AUTH|" deploy/env/single.env
  sed -i "s|37.27.28.78|$IP|g" deploy/env/single.env
  echo ""
  echo "Created deploy/env/single.env — edit ADMIN_EMAIL / ADMIN_PASSWORD before seeding:"
  echo "  nano $APP_DIR/deploy/env/single.env"
  echo ""
fi

echo "Building and starting…"
docker compose -f deploy/docker-compose.single.yml --env-file deploy/env/single.env up -d --build

echo "Seeding catalog + admin (requires ADMIN_* in single.env)…"
docker compose -f deploy/docker-compose.single.yml --env-file deploy/env/single.env --profile setup run --rm seed

echo ""
echo "Done."
echo "  Health:  http://$(curl -4 -fsS ifconfig.me)/api/health"
echo "  Admin:   https://$(curl -4 -fsS ifconfig.me)/admin"
echo "  Enable Test payment mode in Admin → Payments to verify orders."
