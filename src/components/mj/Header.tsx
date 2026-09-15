"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMjStore } from "@/lib/mj/store";

const NAV_LINKS = [
  { href: "/#winkel", label: "Behandelingen" },
  { href: "/#artsen", label: "Artsen" },
  { href: "/#recensies", label: "Reviews" },
];

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      className="mj-nav-badge"
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        background: "var(--color-primary)",
        color: "var(--color-text-on-primary)",
        fontSize: 10,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        borderRadius: "50%",
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {count}
    </span>
  );
}

export function MjHeader() {
  const { count, wishlist } = useMjStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  return (
    <div className="mj-chrome">
      <header className={`mj-header-bar${scrolled ? " mj-header-scrolled" : ""}`}>
        <div className="mj-header-inner">
          <Link href="/" className="mj-header-logo">
            The Clinic
          </Link>

          <nav className="mj-nav-desktop">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`mj-nav-link${isActive(l.href) ? " is-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mj-header-actions">
            <button type="button" aria-label="Verlanglijst" className="mj-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.3l-1.3-1.2C6 14.9 3 12.2 3 8.8 3 6.1 5.1 4 7.7 4c1.6 0 3.1.8 4.3 2.2C13.2 4.8 14.7 4 16.3 4 18.9 4 21 6.1 21 8.8c0 3.4-3 6.1-7.7 10.3L12 20.3z" />
              </svg>
              <Badge count={wishlist.length} />
            </button>
            <Link href="/winkelwagen" aria-label="Winkelwagen" className="mj-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8h12l-1.1 12.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8L6 8z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
              <Badge count={count} />
            </Link>
            <Link
              href="/winkel"
              className="mj-btn mj-btn-primary mj-btn-sm mj-header-cta"
            >
              Kom ik in aanmerking?
            </Link>
            <button
              type="button"
              className="mj-nav-mobile-toggle mj-icon-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mj-mobile-drawer">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 16,
                  color: "var(--color-text)",
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/winkel"
              className="mj-btn mj-btn-primary"
              onClick={() => setMobileOpen(false)}
              style={{ marginTop: 16 }}
            >
              Kom ik in aanmerking?
            </Link>
          </div>
        )}
      </header>

      <div className="mj-clinic-banner">
        <div className="mj-clinic-banner-inner">
          <span className="mj-clinic-banner-text">
            Gratis discrete levering bij iedere bestelling
          </span>
        </div>
      </div>
    </div>
  );
}
