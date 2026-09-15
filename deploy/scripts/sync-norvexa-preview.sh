#!/usr/bin/env bash
# Sync the built NORVEXA static site into deploy/previews/norvexa.
# Source: ../peptide-showcase (sibling repo under ~/.cursor) or PEPTIDE_SHOWCASE_DIR.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="${PEPTIDE_SHOWCASE_DIR:-$(dirname "$ROOT")/peptide-showcase}"
DEST="$ROOT/deploy/previews/norvexa"

if [[ ! -d "$SRC" ]]; then
  echo "peptide-showcase not found at $SRC" >&2
  echo "Set PEPTIDE_SHOWCASE_DIR or clone peptide-showcase next to infra." >&2
  exit 1
fi

echo "Building site in $SRC…"
(cd "$SRC" && npm run build:site)

echo "Syncing → $DEST"
mkdir -p "$DEST"
rsync -a --delete "$SRC/site/" "$DEST/"

echo "Done. Preview files: $(du -sh "$DEST" | cut -f1)"
echo "Deploy: docker compose -f deploy/docker-compose.single.yml --env-file deploy/env/single.env up -d norvexa-preview"
