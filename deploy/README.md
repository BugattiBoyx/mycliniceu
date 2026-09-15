# Self-hosted deployment (Hetzner)

Two servers running the same image with different roles, so that anything
customer-facing can be destroyed and replaced without touching the business.

```
registrar DNS ──► storefront server (public, disposable)
                    caddy  : TLS on demand for any merchant domain
                    app    : DEPLOYMENT_ROLE=storefront (no admin surface)
                       │ private tunnel only
                       ▼
                  control server (private, never in public DNS)
                    caddy  : dashboard, IP-restricted; webhooks open
                    app    : DEPLOYMENT_ROLE=admin
                    db     : postgres + nightly dumps
```

Why this split: a domain ban, an IP blacklisting, or an abuse suspension can
only ever hit the storefront box. Orders, customers, catalog and payment
configuration live on the control server, which no customer ever resolves.

## Servers

| Role | Hetzner type | Notes |
|---|---|---|
| Control plane | CPX21+ (or CX22 to start) | Holds the database. Take snapshots. |
| Storefront | CPX11+ | Disposable. Scale out or rebuild freely. |

Both need Docker and the compose plugin:

```bash
curl -fsSL https://get.docker.com | sh
```

## 1. Private network between the servers

The storefront reaches Postgres over a private link — never the public
internet. Either Hetzner's private network (both servers in the same vSwitch)
or WireGuard if the boxes are at different providers:

```bash
# both servers
apt install -y wireguard
```

Note the control server's private address (e.g. `10.0.0.1`); it goes into
`DB_BIND_IP` on the control side and `DATABASE_URL` on the storefront side.

Lock the public surface down:

```bash
# control server
ufw default deny incoming && ufw allow 22 && ufw allow 80 && ufw allow 443
ufw allow from 10.0.0.0/24 to any port 5432
ufw enable
```

## 2. Control plane

```bash
git clone <your-repo> /opt/mosmo && cd /opt/mosmo
cp deploy/env/control.env.example deploy/env/control.env
$EDITOR deploy/env/control.env          # secrets, CONTROL_DOMAIN, ADMIN_ALLOWED_IPS

docker compose -f deploy/docker-compose.control.yml \
  --env-file deploy/env/control.env up -d --build
```

The app syncs the schema on boot (`RUN_DB_PUSH=1`). Seed the catalog + admin once
(set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `control.env` first):

```bash
docker compose -f deploy/docker-compose.control.yml \
  --env-file deploy/env/control.env --profile setup run --rm seed
```

Demo payments stay disabled. Fake sample orders are never seeded unless you
explicitly set `SEED_DEMO_DATA=true`.

Point `CONTROL_DOMAIN` at this server's IP and confirm:

```bash
curl -s https://control.example-internal.com/api/health
```

Access hardening, strongest first:

1. **VPN only** — do not give the control server a public dashboard at all.
   Reach it over WireGuard/Tailscale and leave port 443 closed to the world.
2. **IP allowlist** — set `ADMIN_ALLOWED_IPS` to the office/VPN CIDRs. Anything
   else gets a 404. Payment webhooks (`/api/webhooks/*`) always pass through.

## 3. Storefront edge

```bash
git clone <your-repo> /opt/mosmo && cd /opt/mosmo
cp deploy/env/storefront.env.example deploy/env/storefront.env
$EDITOR deploy/env/storefront.env       # DATABASE_URL over the tunnel

docker compose -f deploy/docker-compose.storefront.yml \
  --env-file deploy/env/storefront.env up -d --build
```

Verify the edge exposes no admin surface:

```bash
curl -o /dev/null -w '%{http_code}\n' https://shops.example.com/admin   # 404
curl -o /dev/null -w '%{http_code}\n' https://shops.example.com/login   # 404
```

## 4. Connecting merchant domains

Nothing to configure per domain. In the dashboard, open **Domains** for the
active store and add the hostname; the page shows the exact DNS record. At the
registrar:

| Domain type | Record | Value |
|---|---|---|
| Root (`shop.com`) | `A` | storefront server IP |
| Subdomain (`www.shop.com`) | `CNAME` | `STOREFRONT_CNAME`, or `A` to the same IP |

On the first HTTPS request Caddy asks the app whether the hostname belongs to
a live store (`/api/internal/domain-check`) and issues a certificate if so.
Unknown hostnames are refused, so nobody can point DNS at you and consume ACME
rate limits.

## 5. Domain-ban runbook

1. **Domains → Remove** the dead hostname.
2. Add the replacement domain (keep spares pre-registered).
3. Create the DNS record at the registrar.
4. Load the new domain — the certificate is issued on first request.

Store data, order history and customers are untouched: domains are pointers,
everything is keyed by store ID. If a whole store is burned, create a new one
in the dashboard; other stores keep running.

## 6. Backups

The `backup` service writes nightly `pg_dump` archives to `deploy/backups` and
prunes after `BACKUP_KEEP_DAYS`. Get them off the machine — set `RCLONE_REMOTE`
and mount an rclone config, or pull them to a third location:

```bash
rsync -avz control:/opt/mosmo/deploy/backups/ ./offsite-backups/
```

Restore:

```bash
gunzip -c mosmo-20260811-030000.sql.gz | \
  docker compose -f deploy/docker-compose.control.yml \
  --env-file deploy/env/control.env exec -T db psql -U mosmo -d mosmo
```

## 7. Updating

```bash
git pull
docker compose -f deploy/docker-compose.<role>.yml \
  --env-file deploy/env/<role>.env up -d --build
```

Deploy the control plane first (it owns the schema), then the storefront.

## Hardening roadmap

Worth doing before high volume, in order of value:

1. **Move payment-session creation to the control plane.** Checkout currently
   reads `PaymentMethod` (processor API keys, webhook secrets, IBANs) in the
   storefront process, so a seized edge box exposes them. Once the storefront
   asks the control plane for a payment session over the tunnel, the restricted
   database role in `deploy/sql/storefront-role.sql` can be enabled and the
   edge holds no secrets at all.
2. **Restricted database role** — apply after step 1:
   ```bash
   docker compose -f deploy/docker-compose.control.yml \
     --env-file deploy/env/control.env exec -T db \
     psql -U mosmo -d mosmo -v storefront_password="'<pw>'" -f /sql/storefront-role.sql
   ```
3. **Multiple storefront edges** — run several cheap boxes behind different IPs
   and spread merchant domains across them, so one suspension takes down a
   subset rather than everything.
4. **Rotate the payment MID like a domain** — multiple processor accounts
   configured per store, so a frozen MID is a settings change.
