"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("/products/mounjaro.png");
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState([{ label: "1 MG", price: "179" }]);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setError("");
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setImageUrl(data.url);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const storeId = document.cookie
      .split("; ")
      .find((c) => c.startsWith("activeStoreId="))
      ?.split("=")[1];
    if (!storeId) {
      setError("No active store selected");
      return;
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        name: fd.get("name"),
        description: fd.get("description"),
        imageUrl: imageUrl || "/products/mounjaro.png",
        variants: variants.map((v) => ({
          label: v.label,
          price: Number(v.price),
        })),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const isRemote = imageUrl.startsWith("http") || imageUrl.startsWith("data:");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[28px] font-semibold tracking-tight">Add product</h1>
      <form onSubmit={onSubmit} className="admin-card mt-8 space-y-4 p-5">
        <label className="block">
          <span className="admin-label">Name</span>
          <input name="name" required className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Description</span>
          <textarea name="description" rows={3} className="admin-textarea" />
        </label>

        <div>
          <span className="admin-label">Product image</span>
          <div className="mt-1 overflow-hidden rounded-[8px] border border-[#262626] bg-black">
            <div className="relative mx-auto aspect-square max-w-[220px] bg-[#0a0a0a]">
              {isRemote ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt="Product preview"
                  fill
                  className="object-contain p-4"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#1f1f1f] px-3 py-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="admin-btn admin-btn-soft disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <span className="text-[12px] text-[#6a6a6a]">
                JPG, PNG, WEBP, GIF · max 5MB
              </span>
            </div>
          </div>
          <label className="mt-3 block">
            <span className="admin-label">Or image URL</span>
            <input
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value || "/products/mounjaro.png")}
              placeholder="/products/mounjaro.png"
              className="admin-input"
            />
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium">Variants</p>
            <button
              type="button"
              className="text-[13px] text-[#93c5fd]"
              onClick={() => setVariants((v) => [...v, { label: "", price: "" }])}
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Label"
                  value={v.label}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], label: e.target.value };
                    setVariants(next);
                  }}
                  className="admin-input"
                  required
                />
                <input
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], price: e.target.value };
                    setVariants(next);
                  }}
                  className="admin-input"
                  required
                />
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-[13px] text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="admin-btn admin-btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          Save product
        </button>
      </form>
    </div>
  );
}
