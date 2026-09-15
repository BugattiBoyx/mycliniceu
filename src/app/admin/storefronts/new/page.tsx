"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TEMPLATES } from "@/lib/templates";

export default function NewStorefrontPage() {
  const router = useRouter();
  const templates = TEMPLATES;
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!templateId) {
      setError("Select a system template");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        subdomain: fd.get("subdomain"),
        templateId,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create store");
      return;
    }
    document.cookie = `activeStoreId=${data.id};path=/;max-age=31536000`;
    router.push("/admin/storefronts");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[28px] font-semibold tracking-tight">Add storefront</h1>
      <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
        Choose a template from the platform catalog, then publish on your
        subdomain
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <p className="admin-label">System templates</p>
          {templates.length === 0 ? (
            <div className="admin-card px-5 py-8 text-center text-[13px] text-[#6a6a6a]">
              No templates are available in the system yet.
            </div>
          ) : (
            <div className="mt-2 grid gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`flex gap-4 rounded-[10px] border p-4 text-left transition ${
                    templateId === t.id
                      ? "border-[#3b82f6] bg-[#3b82f6]/10"
                      : "border-[#262626] bg-[#141414] hover:border-[#333]"
                  }`}
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[8px] bg-black">
                    <Image
                      src={t.preview}
                      alt=""
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t.name}</p>
                      <span className="text-[11px] text-[#6a6a6a]">
                        v{t.version}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[#8b8b8b]">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block">
          <span className="admin-label">Store name</span>
          <input
            name="name"
            required
            placeholder="The Clinic"
            className="admin-input"
          />
        </label>

        <label className="block">
          <span className="admin-label">Subdomain</span>
          <div className="mt-0 flex items-center gap-2">
            <input
              name="subdomain"
              required
              pattern="[a-z0-9-]+"
              placeholder="my-clinic"
              className="admin-input"
            />
            <span className="shrink-0 text-[13px] text-[#6a6a6a]">.platform</span>
          </div>
        </label>

        {error && <p className="text-[13px] text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !templateId || templates.length === 0}
          className="admin-btn admin-btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create storefront"}
        </button>
      </form>
    </div>
  );
}
