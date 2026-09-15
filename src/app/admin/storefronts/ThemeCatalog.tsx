"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoreTemplate } from "@/lib/templates";

export function ThemeCatalog({
  storeId,
  currentTemplateId,
  templates,
}: {
  storeId: string;
  currentTemplateId: string;
  templates: StoreTemplate[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentTemplateId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    if (!selected) return;
    if (selected === currentTemplateId) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        action: "setTemplate",
        templateId: selected,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json()).error || "Could not apply theme");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => {
          const active = selected === t.id;
          const isCurrent = t.id === currentTemplateId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`overflow-hidden rounded-[10px] border text-left transition ${
                active
                  ? "border-[#3b82f6] bg-[#3b82f6]/10"
                  : "border-[#262626] bg-[#141414] hover:border-[#333]"
              }`}
            >
              <div className="relative aspect-[16/10] bg-black">
                <Image
                  src={t.preview}
                  alt={t.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-medium text-white">{t.name}</p>
                  <span className="text-[11px] text-[#6a6a6a]">v{t.version}</span>
                  <span className="rounded-full bg-[#222] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#8b8b8b]">
                    {t.source}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-[#3b82f6]/15 px-2 py-0.5 text-[11px] text-[#93c5fd]">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12.5px] text-[#8b8b8b]">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="admin-card px-5 py-10 text-center text-[13px] text-[#6a6a6a]">
          No templates yet. Upload a theme file below.
        </div>
      )}

      {error && <p className="text-[13px] text-red-400">{error}</p>}

      <button
        type="button"
        disabled={loading || !selected || selected === currentTemplateId}
        onClick={apply}
        className="admin-btn admin-btn-primary px-5 py-2.5 disabled:opacity-50"
      >
        {loading
          ? "Applying…"
          : selected === currentTemplateId
            ? "Theme already active"
            : "Apply selected template"}
      </button>
    </div>
  );
}
