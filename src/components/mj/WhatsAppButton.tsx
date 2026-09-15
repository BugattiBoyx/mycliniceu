"use client";

import { useEffect, useState } from "react";
import { getWhatsAppUrl } from "@/lib/mj/data";

export function MjWhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [stickyOffset, setStickyOffset] = useState(0);

  useEffect(() => {
    const onStickyBar = (e: Event) => {
      const detail = (e as CustomEvent<{ visible?: boolean }>).detail;
      setStickyOffset(detail?.visible ? 68 : 0);
    };
    window.addEventListener("mj-sticky-bar", onStickyBar);
    return () => window.removeEventListener("mj-sticky-bar", onStickyBar);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: "max(16px, env(safe-area-inset-right))",
        bottom: `calc(max(16px, env(safe-area-inset-bottom)) + ${stickyOffset}px)`,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        transition: "bottom 220ms var(--ease-standard)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          background: "var(--color-primary)",
          color: "var(--color-text-on-primary)",
          fontSize: 12.5,
          fontWeight: 600,
          padding: "8px 14px",
          borderRadius: "var(--radius-pill)",
          marginRight: 10,
          whiteSpace: "nowrap",
          boxShadow: "var(--shadow-md)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(6px)",
          transition: "opacity 180ms var(--ease-standard), transform 180ms var(--ease-standard)",
        }}
      >
        Chat met ons
      </span>
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact via WhatsApp"
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: hovered
            ? "0 10px 24px rgba(15,36,33,.30)"
            : "0 6px 16px rgba(15,36,33,.22)",
          transform: hovered ? "translateY(-3px) scale(1.04)" : "translateY(0) scale(1)",
          transition:
            "transform 220ms var(--ease-standard), box-shadow 220ms var(--ease-standard)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden>
          <path
            fill="white"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.104.549 4.158 1.595 5.972L0 24l6.335-1.652a11.94 11.94 0 0 0 5.71 1.454h.005c6.585 0 11.945-5.36 11.948-11.943a11.87 11.87 0 0 0-3.478-8.41"
          />
        </svg>
      </a>
    </div>
  );
}
