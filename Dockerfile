# Self-hosted image for the Mosmo platform (control plane and storefront run
# the same image with a different DEPLOYMENT_ROLE).

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# Alpine/linux optional deps can drift from a macOS-generated lockfile.
# Prefer a clean ci install; fall back so the image still builds.
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps --no-audit --no-fund

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so they must be build args.
ARG NEXT_PUBLIC_ROOT_DOMAIN="localhost"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_SITE_NAME="The Clinic"
ARG NEXT_PUBLIC_SITE_EMAIL="info@theclinic.nl"
ARG NEXT_PUBLIC_PHARMACY_NAME=""
ARG NEXT_PUBLIC_COMPANY_NAME=""
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_EMAIL=$NEXT_PUBLIC_SITE_EMAIL
ENV NEXT_PUBLIC_PHARMACY_NAME=$NEXT_PUBLIC_PHARMACY_NAME
ENV NEXT_PUBLIC_COMPANY_NAME=$NEXT_PUBLIC_COMPANY_NAME

ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder only — Prisma needs a syntactically valid URL to generate the
# client. The real connection string is injected at runtime.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN npm run build:app

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl wget
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable uploads dir (admin product images). Must exist before USER so the
# named volume inherits nextjs ownership on first create.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public

# Prisma CLI + schema so the control plane can sync the schema on boot.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

COPY deploy/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
