# Dennycutler deploy — 77.42.71.112

## GitHub (optional — deploy does not require repo transfer)

Code lives at **https://github.com/BugattiBoyx/mycliniceu** (private).

**Collaborator invite** sent to **dennycutler6-bit** — friend accepts:
https://github.com/BugattiBoyx/mycliniceu/invitations

Repo transfer to `dennycutler6-bit/mycliniceu` can wait; use collaborator access for now.

## Why http://77.42.71.112 shows “connection refused”

Nothing is deployed yet — port 80 has no web server. That is expected until bootstrap or `./deploy/scripts/deploy-friend-clinic.sh` completes successfully.

## Path A — Aaron deploys (needs SSH)

Friend pastes this in **Hetzner → Server → Console** (as root):

```bash
bash -c 'mkdir -p /root/.ssh && chmod 700 /root/.ssh && grep -q github-bugatti-telehealth /root/.ssh/authorized_keys 2>/dev/null || echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQRQTYAS3vp3yQmt6zJdFTs/g73tZuCiTmwQP0MPSdp github-bugatti-telehealth" >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && echo SSH_OK'
```

Then from Aaron's Mac:

```bash
./deploy/scripts/deploy-friend-clinic.sh root@77.42.71.112
```

## Path B — Friend deploys from Hetzner console (no Aaron SSH)

1. Accept GitHub invite (link above).
2. Create a GitHub token: Settings → Developer settings → Personal access tokens (repo read).
3. In Hetzner console as root, create env file (Aaron sends `deploy/env/friend-clinic.env` contents privately).
4. Run `deploy/scripts/friend-hetzner-console.sh` from the cloned repo, or paste that script after cloning.

## Full bootstrap on server (after code is on box)

```bash
cd /opt/mosmo
nano deploy/env/friend-clinic.env   # confirm ADMIN_EMAIL / ADMIN_PASSWORD
bash deploy/scripts/bootstrap-friend-clinic.sh
```

## URLs (no domain yet)

- Shop: http://77.42.71.112/
- Admin: http://77.42.71.112/admin

Login credentials: see `deploy/DENNYCUTLER-CREDENTIALS.local` (not in git).
