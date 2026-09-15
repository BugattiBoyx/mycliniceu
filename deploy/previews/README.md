# Static storefront previews

Customer-facing **preview builds** that are not wired to checkout or the database.
Useful for sign-off before a theme goes live on a merchant domain.

| Preview | Path | Public URL (single box) |
|---|---|---|
| NORVEXA Bioscience (WoodMart mirror) | `norvexa/` | `http://<STOREFRONT_IP>:8080/` |

## Update NORVEXA preview

From the infra repo root:

```bash
bash deploy/scripts/sync-norvexa-preview.sh
git add deploy/previews/norvexa
git commit -m "Update NORVEXA preview build."
git push
```

On the server:

```bash
cd /opt/mosmo && git pull
docker compose -f deploy/docker-compose.single.yml \
  --env-file deploy/env/single.env up -d norvexa-preview
```

First boot also opens port **8080** on the host (`ufw allow 8080` if ufw is enabled).

## Notes

- The NORVEXA build is a static HTML mirror (no cart, no checkout).
- Assets use root-absolute paths (`/images/…`), so this preview must be served from `/` on its own port — not under a subpath on the main app.
