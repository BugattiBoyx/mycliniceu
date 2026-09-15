#!/usr/bin/env bash
# Paste in Hetzner → Server → Console as root (friend self-deploy, no Aaron SSH needed).
#
# Before running:
#   1. Accept GitHub invite: https://github.com/BugattiBoyx/mycliniceu/invitations
#   2. Create token: https://github.com/settings/tokens → Fine-grained or classic (repo read)
#   3. Export: export GITHUB_TOKEN='ghp_...'
#   4. Run: bash friend-hetzner-console.sh   (or paste this whole file)

set -euo pipefail

APP_DIR="/opt/mosmo"
REPO="https://github.com/BugattiBoyx/mycliniceu.git"
IP="77.42.71.112"

# Aaron deploy key (so Aaron can rsync updates later)
mkdir -p /root/.ssh && chmod 700 /root/.ssh
grep -q 'github-bugatti-telehealth' /root/.ssh/authorized_keys 2>/dev/null || \
  echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQRQTYAS3vp3yQmt6zJdFTs/g73tZuCiTmwQP0MPSdp github-bugatti-telehealth' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

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

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Set GITHUB_TOKEN first (GitHub → Settings → Developer settings → Personal access tokens)"
  echo "  export GITHUB_TOKEN='ghp_...'"
  exit 1
fi

if [ ! -f "$APP_DIR/package.json" ]; then
  rm -rf "$APP_DIR"
  git clone "https://dennycutler6-bit:${GITHUB_TOKEN}@github.com/BugattiBoyx/mycliniceu.git" "$APP_DIR"
fi

cd "$APP_DIR"

ENV_FILE="deploy/env/friend-clinic.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — ask Aaron for deploy/env/friend-clinic.env and place it at $APP_DIR/$ENV_FILE"
  exit 1
fi

echo "Building Clinic on http://${IP}/ …"
docker compose -f deploy/docker-compose.bootstrap.yml --env-file "$ENV_FILE" up -d --build
docker compose -f deploy/docker-compose.bootstrap.yml --env-file "$ENV_FILE" --profile setup run --rm seed || true

echo ""
echo "Done. Open http://${IP}/ and http://${IP}/admin"
echo "Health: curl -s http://${IP}/api/health"
