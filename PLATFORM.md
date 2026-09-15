# Platform overview

This repository is **infrastructure first**. Themes are templates that plug into it.

## Infrastructure (always on)

- Multi-store admin with store switcher
- Products, variants, discounts, customers, orders, shipments
- Custom domains (attach / remove; DNS instructions; Vercel or self-host)
- Payment methods: high-risk processor, crypto, bank transfer, test mode
- Checkout API (server-side prices, discount validation)
- Deployment roles: `admin` | `storefront` | `combined`
- Hetzner / Docker / Caddy under `deploy/`

## Themes (templates)

Registered in `src/lib/templates.ts`, documented under `src/templates/<id>/`.

Each store has a `templateId`. Changing the theme does not move orders, customers, or payment config.

Current system theme: **moun-journey** (`src/templates/moun-journey/`).

## Quick start

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

| Surface | URL |
|---|---|
| Admin | http://localhost:3000/admin |
| Theme (Moun Journey) | http://localhost:3000/ |
| Tenant path | http://localhost:3000/store/moun-journey |

## Env

See `.env.example`. Important production vars:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres |
| `AUTH_SECRET` | Auth.js |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First seed admin |
| `DEPLOYMENT_ROLE` | `admin` / `storefront` / unset (combined) |
| `SIGNUP_INVITE_CODE` | Accounts after the first |
| `ALLOW_DEMO_PAYMENTS` | Set `false` to lock test mode off |
| `DOMAIN_PROVIDER` | `selfhost` or `vercel` |
| `STOREFRONT_IP` | DNS A-record target shown in Domains |

## Deploy

- Single box: `deploy/docker-compose.single.yml` + `deploy/scripts/bootstrap-hetzner.sh`
- Split plane: `deploy/README.md` (control + storefront)

## Payments

Admin → Payments:

1. **Test payment mode** — enable to verify full order flow (no charge)
2. Disable test mode before real traffic
3. Configure high-risk / crypto / bank transfer when gateways are ready
