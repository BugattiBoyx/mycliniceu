# Dennycutler deploy — 77.42.71.112

GitHub: **https://github.com/dennycutler6-bit/mycliniceu**

## If SSH from Aaron's Mac fails

Friend pastes this in **Hetzner → Server → Console** (as root):

```bash
mkdir -p /root/.ssh && chmod 700 /root/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQRQTYAS3vp3yQmt6zJdFTs/g73tZuCiTmwQP0MPSdp github-bugatti-telehealth' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
echo "SSH key added"
```

Then Aaron runs deploy again.

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
