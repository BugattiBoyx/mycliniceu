"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ThemeUploadForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/themes", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setSaved(true);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4 p-5">
      <div>
        <p className="text-[14px] font-medium text-white">Add theme file</p>
        <p className="mt-1 text-[12.5px] text-[#8b8b8b]">
          Upload a theme package (ZIP, HTML, CSS, or JSON). It appears in the
          template list so you can apply it to this store.
        </p>
      </div>
      <label className="block">
        <span className="admin-label">Theme name</span>
        <input name="name" required placeholder="My clinic theme" className="admin-input" />
      </label>
      <label className="block">
        <span className="admin-label">Description</span>
        <textarea
          name="description"
          rows={2}
          placeholder="Optional notes about this theme"
          className="admin-textarea"
        />
      </label>
      <label className="block">
        <span className="admin-label">Theme file</span>
        <input
          name="themeFile"
          type="file"
          required
          accept=".zip,.html,.css,.json,application/zip,text/html,text/css,application/json"
          className="mt-1 block w-full text-[13px] text-[#9a9a9a] file:mr-3 file:rounded-md file:border-0 file:bg-[#1c1c1c] file:px-3 file:py-2 file:text-[12.5px] file:text-white"
        />
      </label>
      <label className="block">
        <span className="admin-label">Preview image (optional)</span>
        <input
          name="previewFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 block w-full text-[13px] text-[#9a9a9a] file:mr-3 file:rounded-md file:border-0 file:bg-[#1c1c1c] file:px-3 file:py-2 file:text-[12.5px] file:text-white"
        />
      </label>
      {error && <p className="text-[13px] text-red-400">{error}</p>}
      {saved && <p className="text-[13px] text-[#93c5fd]">Theme added to catalog</p>}
      <button
        type="submit"
        disabled={loading}
        className="admin-btn admin-btn-primary px-5 py-2.5 disabled:opacity-60"
      >
        {loading ? "Uploading…" : "Add theme"}
      </button>
    </form>
  );
}
