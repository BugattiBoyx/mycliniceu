"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SettingsForm({
  store,
}: {
  store: {
    id: string;
    name: string;
    contactEmail: string;
    tagline: string;
    description: string;
    brandColor: string;
    legalPrivacy: string;
    legalTerms: string;
  };
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: store.id,
        name: fd.get("name"),
        contactEmail: fd.get("contactEmail"),
        tagline: fd.get("tagline"),
        description: fd.get("description"),
        brandColor: fd.get("brandColor"),
        legalPrivacy: fd.get("legalPrivacy"),
        legalTerms: fd.get("legalTerms"),
      }),
    });
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(
        [
          ["name", "Store name", store.name],
          ["contactEmail", "Contact email", store.contactEmail],
          ["tagline", "Tagline", store.tagline],
          ["brandColor", "Brand color", store.brandColor],
        ] as const
      ).map(([name, label, value]) => (
        <label key={name} className="block">
          <span className="admin-label">{label}</span>
          <input name={name} defaultValue={value} className="admin-input" />
        </label>
      ))}
      <label className="block">
        <span className="admin-label">Description</span>
        <textarea
          name="description"
          defaultValue={store.description}
          rows={3}
          className="admin-textarea"
        />
      </label>
      <label className="block">
        <span className="admin-label">Privacy policy</span>
        <textarea
          name="legalPrivacy"
          defaultValue={store.legalPrivacy}
          rows={3}
          className="admin-textarea"
        />
      </label>
      <label className="block">
        <span className="admin-label">Terms</span>
        <textarea
          name="legalTerms"
          defaultValue={store.legalTerms}
          rows={3}
          className="admin-textarea"
        />
      </label>
      {saved && <p className="text-[13px] text-[#93c5fd]">Saved</p>}
      <button type="submit" className="admin-btn admin-btn-primary px-5 py-2.5">
        Save settings
      </button>
    </form>
  );
}
