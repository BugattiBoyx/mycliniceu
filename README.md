# infra

Private multi-store commerce **infrastructure** for high-risk storefronts (pharmacy / GLP-1 and similar).

One control plane. Many stores. Disposable domains. Themes are templates inside the platform — not separate products.

```
infra/
├── deploy/                 ← Hetzner / Docker / Caddy (how you run it)
├── src/app/admin/          ← merchant dashboard (multi-store)
├── src/app/api/            ← checkout, domains, payments, webhooks
├── src/templates/          ← storefront themes (templates)
│   └── moun-journey/       ← default high-risk pharmacy theme
├── src/app/(marketing)/    ← Moun Journey theme (live pages)
├── src/components/mj/      ← theme UI
└── prisma/                 ← shared data model (stores, orders, domains…)
```

## What this is

| Layer | Role |
|---|---|
| **Infrastructure** | Auth, multi-store admin, products, orders, customers, domains, payments, shipments, backups |
| **Themes** | Visual + UX templates selected per store (`templateId`). Swap without touching data |
| **Domains** | Pointers only. Banned domain → connect a new one; store data stays |

## Deploy (Hetzner)

Single box (fits CX23 4 GB):

```bash
# on the server
git clone git@github.com:BugattiBoyx/infra.git /opt/mosmo
cd /opt/mosmo
cp deploy/env/single.env.example deploy/env/single.env
# edit ADMIN_EMAIL, ADMIN_PASSWORD, secrets, STOREFRONT_IP
bash deploy/scripts/bootstrap-hetzner.sh
```

Split control plane / storefront later: see `deploy/README.md`.

**Customer preview (NORVEXA showcase):** after deploy, share `http://<STOREFRONT_IP>:8080/` — see `deploy/previews/README.md`.

## Themes (templates)

Built-in themes live under `src/templates/`. Merchants pick one when creating a store and can change it in **Admin → Storefronts → Themes**.

| Template id | Name | Status |
|---|---|---|
| `moun-journey` | Moun Journey | Default — Dutch GLP-1 / pharmacy storefront |

Docs for each theme: `src/templates/<id>/README.md`.

To add another theme later: ship a new folder under `src/templates/`, register it in `src/lib/templates.ts`, and map routes/components. Infrastructure (orders, payments, domains) stays the same.

## Local develop

```bash
npm install
cp .env.example .env
npm run db:setup          # needs ADMIN_EMAIL / ADMIN_PASSWORD in production
npm run dev
```

- Admin: http://localhost:3000/admin  
- Storefront (Moun Journey theme): http://localhost:3000/

## Production notes

- Signup is invite-only after the first account (`SIGNUP_INVITE_CODE`)
- **Test payment mode** is toggled in Admin → Payments (no real charge)
- Before real customers: disable test mode and enable a live gateway
- Set `ALLOW_DEMO_PAYMENTS=false` on handoff to lock test mode off

## Repo

Private: `https://github.com/BugattiBoyx/infra`
