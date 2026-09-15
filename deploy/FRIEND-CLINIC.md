# Friend Clinic — second Hetzner deploy (no domain yet)

Same **My Clinic** theme as `thecliniceu.com`, on a **separate server** with its own database. Works over **http://SERVER_IP** until DNS is connected.

## One-time server setup (friend's Hetzner box)

1. Create an Ubuntu server (CX23 is enough).
2. From your Mac, push code and bootstrap:

```bash
chmod +x deploy/scripts/deploy-friend-clinic.sh deploy/scripts/bootstrap-friend-clinic.sh

# Sync code
./deploy/scripts/deploy-friend-clinic.sh root@FRIEND_SERVER_IP

# SSH in and finish setup
ssh root@FRIEND_SERVER_IP
cd /opt/mosmo
nano deploy/env/friend-clinic.env   # set ADMIN_EMAIL + ADMIN_PASSWORD (8+ chars)
bash deploy/scripts/bootstrap-friend-clinic.sh
```

3. Open in browser:
   - Shop: `http://FRIEND_SERVER_IP/`
   - Admin: `http://FRIEND_SERVER_IP/admin`
   - Enable **Test payment mode** in Admin → Payments

## Later updates (from your Mac)

```bash
./deploy/scripts/deploy-friend-clinic.sh root@FRIEND_SERVER_IP
```

## When they have a domain

1. Point DNS A records to the server IP.
2. Edit `deploy/env/friend-clinic.env`:

```env
NEXT_PUBLIC_ROOT_DOMAIN=theirshop.com
NEXT_PUBLIC_APP_URL=https://theirshop.com
CONTROL_DOMAIN=admin.theirshop.com
AUTH_URL=https://admin.theirshop.com
ALLOW_IP_ACCESS=false
```

3. Switch compose file:

```bash
docker compose -f deploy/docker-compose.single.yml \
  --env-file deploy/env/friend-clinic.env up -d --build
```

## vs thecliniceu.com

| | thecliniceu.com | Friend server |
|---|---|---|
| Code | Same repo | Same repo |
| Env | `deploy/env/single.env` | `deploy/env/friend-clinic.env` |
| Compose | `docker-compose.single.yml` | `docker-compose.bootstrap.yml` (IP) |
| Data | Separate Postgres | Separate Postgres |

No second git repo needed.
