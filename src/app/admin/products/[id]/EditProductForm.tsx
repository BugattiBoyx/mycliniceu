"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type VariantDraft = {
  id?: string;
  label: string;
  price: string;
  stock: string;
};

type ProductDraft = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  status: string;
  variants: VariantDraft[];
};

function Preview({ src, alt }: { src: string; alt: string }) {
  const remote = src.startsWith("http") || src.startsWith("data:");
  if (remote) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="h-full w-full object-contain p-3" />;
  }
  return <Image src={src} alt={alt} fill className="object-contain p-3" />;
}

export function EditProductForm({ product }: { product: ProductDraft }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [status, setStatus] = useState(product.status);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [gallery, setGallery] = useState<string[]>(product.galleryUrls);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product.variants.length
      ? product.variants
      : [{ label: "Default", price: "0", stock: "100" }],
  );

  async function uploadFile(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return null;
    }
    return data.url as string;
  }

  async function onPrimaryFile(file: File | null) {
    if (!file) return;
    setError("");
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) setImageUrl(url);
  }

  async function onGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    setUploading(false);
    if (urls.length) setGallery((g) => [...g, ...urls]);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        name,
        slug,
        description,
        status,
        imageUrl,
        galleryUrls: gallery,
        variants: variants.map((v) => ({
          id: v.id,
          label: v.label,
          price: Number(v.price),
          stock: Number(v.stock) || 100,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-card mt-8 space-y-4 p-5">
      <label className="block">
        <span className="admin-label">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="admin-input"
        />
      </label>

      <label className="block">
        <span className="admin-label">Slug</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="admin-input"
        />
      </label>

      <label className="block">
        <span className="admin-label">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="admin-textarea"
        />
      </label>

      <label className="block">
        <span className="admin-label">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-input"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </label>

      <div>
        <span className="admin-label">Primary image</span>
        <div className="mt-1 overflow-hidden rounded-[8px] border border-[#262626] bg-black">
          <div className="relative mx-auto aspect-square max-w-[220px] bg-[#0a0a0a]">
            <Preview src={imageUrl} alt="Primary product" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[#1f1f1f] px-3 py-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPrimaryFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="admin-btn admin-btn-soft disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
          </div>
        </div>
        <label className="mt-3 block">
          <span className="admin-label">Or image URL</span>
          <input
            value={imageUrl.startsWith("data:") ? "" : imageUrl}
            onChange={(e) => setImageUrl(e.target.value || "/products/mounjaro.png")}
            className="admin-input"
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="admin-label mb-0">Gallery photos</span>
          <button
            type="button"
            disabled={uploading}
            onClick={() => galleryRef.current?.click()}
            className="text-[13px] text-[#93c5fd] disabled:opacity-50"
          >
            + Add photos
          </button>
        </div>
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            onGalleryFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {gallery.length === 0 ? (
          <p className="text-[13px] text-[#6a6a6a]">
            No extra photos yet. Add more images for the product page gallery.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((url) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-[8px] border border-[#262626] bg-[#0a0a0a]"
              >
                <Preview src={url} alt="Gallery" />
                <button
                  type="button"
                  onClick={() => setGallery((g) => g.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-medium">Variants</p>
          <button
            type="button"
            className="text-[13px] text-[#93c5fd]"
            onClick={() =>
              setVariants((v) => [...v, { label: "", price: "", stock: "100" }])
            }
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.id || i} className="grid grid-cols-[1fr_1fr_72px_auto] gap-2">
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
              <input
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], stock: e.target.value };
                  setVariants(next);
                }}
                className="admin-input"
              />
              <button
                type="button"
                className="text-[12px] text-red-400"
                onClick={() => setVariants((list) => list.filter((_, idx) => idx !== i))}
                disabled={variants.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-[13px] text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || uploading}
          className="admin-btn admin-btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <Link href="/admin/products" className="admin-btn admin-btn-soft">
          Cancel
        </Link>
      </div>
    </form>
  );
}
