# Theme: The Clinic

| | |
|---|---|
| **Template id** | `moun-journey` |
| **Type** | System theme (ships with infra) |
| **Locale** | NL (Dutch) |
| **Category** | High-risk pharmacy / GLP-1 |

## What merchants get

Editorial pine/ivory storefront with:

- Homepage (hero, products, science, doctors, reviews, FAQ)
- Shop + product detail (`/winkel`, `/winkel/mounjaro`, `/winkel/ozempic`)
- Cart, checkout, order confirmation
- Cart drawer, WhatsApp widget, Trustpilot bar
- Design tokens in `src/app/(marketing)/mj.css`

## Code map (inside infra)

| Piece | Path |
|---|---|
| Pages | `src/app/(marketing)/` |
| Components | `src/components/mj/` |
| Cart / wishlist store | `src/lib/mj/store.tsx` |
| Catalog copy + prices | `src/lib/mj/data.ts` |
| Assets | `public/products/`, `public/reviews/`, `public/doctors/` |

Infrastructure (checkout API, orders DB, domains, payment methods) is **not** part of the theme — it lives in `src/app/api/` and `prisma/`. The theme only renders and posts orders to the platform.

## Selecting the theme

1. Admin → Storefronts → create store (or open an existing one)
2. Themes → choose **The Clinic** → Apply

Creating a store with this template seeds Mounjaro + Ozempic variants (see `prisma/seed.ts`).

## Preview asset

Registered in `src/lib/templates.ts` as preview `/products/mounjaro-pen.png`.
