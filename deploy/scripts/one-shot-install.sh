#!/usr/bin/env bash
# One-shot Clinic install for 77.42.71.112 — paste in Hetzner web console as root.
#   curl -fsSL https://raw.githubusercontent.com/BugattiBoyx/mycliniceu/main/deploy/scripts/one-shot-install.sh | bash
set -euo pipefail

APP_DIR="/opt/mosmo"
IP="77.42.71.112"
REPO="https://github.com/BugattiBoyx/mycliniceu.git"

echo "→ Adding deploy SSH key…"
mkdir -p /root/.ssh && chmod 700 /root/.ssh
grep -q 'github-bugatti-telehealth' /root/.ssh/authorized_keys 2>/dev/null || \
  echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQRQTYAS3vp3yQmt6zJdFTs/g73tZuCiTmwQP0MPSdp github-bugatti-telehealth' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

export DEBIAN_FRONTEND=noninteractive
if ! command -v docker >/dev/null 2>&1; then
  echo "→ Installing Docker…"
  apt-get update -y
  apt-get install -y ca-certificates curl git ufw fail2ban
  curl -fsSL https://get.docker.com | sh
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw --force enable
fi

if [ ! -f "$APP_DIR/package.json" ]; then
  echo "→ Cloning Clinic…"
  rm -rf "$APP_DIR"
  git clone --depth 1 "$REPO" "$APP_DIR"
fi

mkdir -p "$APP_DIR/deploy/env"
cat > "$APP_DIR/deploy/env/friend-clinic.env" <<'ENV'
NEXT_PUBLIC_SITE_NAME=mycliniceu
NEXT_PUBLIC_SITE_EMAIL=info@mycliniceu.com
NEXT_PUBLIC_PHARMACY_NAME=mycliniceu Pharmacy
NEXT_PUBLIC_COMPANY_NAME=mycliniceu B.V.
STORE_NAME=mycliniceu
POSTGRES_USER=mosmo
POSTGRES_PASSWORD=h0Uut9ZAws6TrPxjjexcUoqr21L2Kg3
POSTGRES_DB=mosmo
AUTH_SECRET=04TC3aD6z46VyBhrCgLTS+vCBCm3DyPG77es6nejqVm9oPkHMQdqPwNlPSOvVOAw
STOREFRONT_IP=77.42.71.112
NEXT_PUBLIC_ROOT_DOMAIN=77.42.71.112
NEXT_PUBLIC_APP_URL=http://77.42.71.112
CONTROL_DOMAIN=77.42.71.112
AUTH_URL=http://77.42.71.112
ACME_EMAIL=admin@mycliniceu.com
ADMIN_EMAIL=admin@mycliniceu.com
ADMIN_PASSWORD=1ZBNdBEgImt2wHmoAa1
ADMIN_NAME=The Clinic Owner
SIGNUP_INVITE_CODE=
ALLOW_DEMO_PAYMENTS=
DEPLOYMENT_ROLE=combined
ALLOW_IP_ACCESS=true
ADMIN_ALLOWED_IPS=0.0.0.0/0 ::/0
ENV

cd "$APP_DIR"
echo "→ Building (5–10 min)…"
docker compose -f deploy/docker-compose.bootstrap.yml --env-file deploy/env/friend-clinic.env up -d --build
docker compose -f deploy/docker-compose.bootstrap.yml --env-file deploy/env/friend-clinic.env --profile setup run --rm seed || true

echo ""
echo "Done."
echo "  Shop:   http://${IP}/"
echo "  Admin:  http://${IP}/admin"
echo "  Health: http://${IP}/api/health"
