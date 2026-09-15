-- Least-privilege database role for the storefront edge server.
--
-- The storefront is the exposed, disposable half of the platform. If that box
-- is ever seized or compromised, the credentials on it must not be enough to
-- read admin logins or payment processor secrets, or to alter the schema.
--
-- Run AFTER the schema exists (the control plane creates it on first boot):
--   docker compose -f deploy/docker-compose.control.yml --env-file deploy/env/control.env \
--     exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--     -v storefront_password="'<strong-password>'" -f /sql/storefront-role.sql

\set ON_ERROR_STOP on

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'storefront') THEN
    CREATE ROLE storefront LOGIN;
  END IF;
END
$$;

ALTER ROLE storefront WITH PASSWORD :storefront_password;

-- No schema changes from the edge, ever.
REVOKE ALL ON SCHEMA public FROM storefront;
GRANT USAGE ON SCHEMA public TO storefront;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM storefront;

-- Catalog and storefront configuration: read only.
GRANT SELECT ON
  "Store",
  "Product",
  "ProductVariant",
  "Category",
  "Discount",
  "Theme"
TO storefront;

-- Domain resolution for host -> store routing.
GRANT SELECT ON "Domain" TO storefront;

-- Checkout needs to create orders and customers.
GRANT SELECT, INSERT, UPDATE ON
  "Order",
  "OrderItem",
  "Customer",
  "Cart",
  "CartItem"
TO storefront;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO storefront;

-- Deliberately NOT granted: "User" and "StoreMember" (admin login hashes),
-- "PaymentMethod" (processor API keys, webhook secrets, IBANs) and "Shipment".
--
-- NOTE: checkout currently reads "PaymentMethod" in-process, so enabling this
-- role requires moving payment-session creation to the control plane first.
-- See "Hardening roadmap" in deploy/README.md.

-- Keep the restriction in place for tables added by future migrations.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM storefront;
