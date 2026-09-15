"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ConnectResult = {
  hostname: string;
  vercel?: { attached: boolean; note?: string };
  dns?: { recordType: string; recordName: string; recordValue: string };
};

export function DomainForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConnectResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        hostname: fd.get("hostname"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setResult(data);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="admin-label">Custom domain</span>
          <input
            name="hostname"
            required
            placeholder="shop.example.com"
            className="admin-input"
          />
        </label>
        {error && <p className="text-[13px] text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary"
        >
          {loading ? "Connecting…" : "Connect domain"}
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-[8px] border border-[#262626] bg-[#0a0a0a] p-4 text-[13px]">
          <p className="font-medium text-white">
            {result.hostname} connected
            {result.vercel?.attached
              ? " — SSL will be issued automatically"
              : ""}
          </p>
          {result.vercel && !result.vercel.attached && result.vercel.note && (
            <p className="mt-1 text-[#f59e0b]">{result.vercel.note}</p>
          )}
          {result.dns && (
            <div className="mt-3 text-[#8b8b8b]">
              <p>Add this DNS record at your registrar:</p>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-[6px] bg-black p-3 font-mono text-[12px] text-[#93c5fd]">
                <span>{result.dns.recordType}</span>
                <span>{result.dns.recordName}</span>
                <span>{result.dns.recordValue}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RemoveDomainButton({ domainId }: { domainId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Remove this domain? Traffic to it will stop resolving."))
      return;
    setBusy(true);
    await fetch("/api/domains", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-[12px] text-[#8b8b8b] underline hover:text-red-400 disabled:opacity-50"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
  );
}
