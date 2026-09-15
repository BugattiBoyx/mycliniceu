#!/usr/bin/env bash
# Paste in Hetzner web console as root if SSH from deploy machine fails.
mkdir -p /root/.ssh && chmod 700 /root/.ssh
grep -q 'github-bugatti-telehealth' /root/.ssh/authorized_keys 2>/dev/null || \
  echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQRQTYAS3vp3yQmt6zJdFTs/g73tZuCiTmwQP0MPSdp github-bugatti-telehealth' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
echo "SSH key added for deploy."
