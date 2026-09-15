#!/bin/sh
# Periodic pg_dump loop. Runs inside the backup container.
set -eu

KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
DIR=/backups

mkdir -p "$DIR"

while true; do
  STAMP="$(date -u +%Y%m%d-%H%M%S)"
  FILE="$DIR/${PGDATABASE}-${STAMP}.sql.gz"
  echo "[backup] writing $FILE"

  if pg_dump --no-owner --no-privileges | gzip -9 > "$FILE.tmp"; then
    mv "$FILE.tmp" "$FILE"
    echo "[backup] ok ($(du -h "$FILE" | cut -f1))"
  else
    echo "[backup] FAILED" >&2
    rm -f "$FILE.tmp"
  fi

  find "$DIR" -name "${PGDATABASE}-*.sql.gz" -type f -mtime "+${KEEP_DAYS}" -delete

  # Off-site copy: set RCLONE_REMOTE (e.g. "b2:mosmo-backups") and mount an
  # rclone config to push dumps off the server. A backup that only exists on
  # the box you are protecting is not a backup.
  if [ -n "${RCLONE_REMOTE:-}" ] && command -v rclone > /dev/null 2>&1; then
    rclone copy "$FILE" "$RCLONE_REMOTE" || echo "[backup] off-site copy failed" >&2
  fi

  sleep "$INTERVAL"
done
