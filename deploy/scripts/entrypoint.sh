#!/bin/sh
set -e

# Only the control plane owns the schema. Storefront containers never migrate.
if [ "$RUN_DB_PUSH" = "1" ]; then
  echo "[entrypoint] syncing database schema…"
  ./node_modules/.bin/prisma db push --skip-generate
fi

echo "[entrypoint] starting role=${DEPLOYMENT_ROLE:-combined}"
exec "$@"
