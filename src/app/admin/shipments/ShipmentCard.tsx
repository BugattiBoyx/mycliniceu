"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatEuro } from "@/lib/format";
import { CARRIERS, shipmentStatusLabel } from "@/lib/shipment-constants";

function statusTone(status: string) {
  if (status === "shipped" || status === "delivered") return "text-[#5b8def]";
  if (status === "cancelled") return "text-[#8b8b8b]";
  return "text-[#f0b429]";
}

export function ShipmentCard({
  shipmentId,
  orderId,
  orderNumber,
  customerLabel,
  total,
  itemCount,
  addressLine,
  initialStatus,
  initialCarrier,
  initialTrackingNumber,
  initialTrackingUrl,
  initialNotes,
  initialShippedAt,
}: {
  shipmentId: string;
  orderId: string;
  orderNumber: string;
  customerLabel: string;
  total: number;
  itemCount: number;
  addressLine: string | null;
  initialStatus: string;
  initialCarrier: string | null;
  initialTrackingNumber: string | null;
  initialTrackingUrl: string | null;
  initialNotes: string | null;
  initialShippedAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl);
  const [notes, setNotes] = useState(initialNotes);
  const [shippedAt, setShippedAt] = useState(initialShippedAt);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsShip = status === "unfulfilled" || status === "preparing";

  async function save(payload: {
    status: string;
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    notes: string;
  }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shipments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Update failed");
        setLoading(false);
        return false;
      }

      const saved = data.shipment as {
        status: string;
        carrier: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        notes: string | null;
        shippedAt: string | null;
      };

      setStatus(saved.status);
      setCarrier(saved.carrier);
      setTrackingNumber(saved.trackingNumber);
      setTrackingUrl(saved.trackingUrl);
      setNotes(saved.notes);
      setShippedAt(saved.shippedAt);
      setOpen(false);
      setLoading(false);
      router.refresh();
      return true;
    } catch {
      setError("Network error — try again");
      setLoading(false);
      return false;
    }
  }

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tracking = String(fd.get("trackingNumber") || "").trim();
    const selected = String(fd.get("status") || "shipped");
    // Always mark shipped when saving tracking, or when status is shipped
    const nextStatus =
      selected === "cancelled"
        ? "cancelled"
        : tracking || selected === "shipped"
          ? "shipped"
          : selected;

    await save({
      status: nextStatus,
      carrier: String(fd.get("carrier") || ""),
      trackingNumber: tracking,
      trackingUrl: String(fd.get("trackingUrl") || ""),
      notes: String(fd.get("notes") || ""),
    });
  }

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/orders/${orderId}`}
              className="text-[15px] font-medium text-white hover:underline"
            >
              {orderNumber}
            </Link>
            <span className={`text-[12px] font-medium ${statusTone(status)}`}>
              {shipmentStatusLabel(status)}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#8b8b8b]">
            {customerLabel} · {formatEuro(total)} · {itemCount} item
            {itemCount === 1 ? "" : "s"}
          </p>
          {addressLine && (
            <p className="mt-2 text-[13px] text-[#cfcfcf]">{addressLine}</p>
          )}
          {(carrier || trackingNumber) && (
            <p className="mt-2 text-[12.5px] text-[#8b8b8b]">
              {carrier && <span>{carrier}</span>}
              {carrier && trackingNumber && " · "}
              {trackingNumber &&
                (trackingUrl ? (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5b8def] hover:underline"
                  >
                    {trackingNumber}
                  </a>
                ) : (
                  <span className="font-mono">{trackingNumber}</span>
                ))}
            </p>
          )}
          {shippedAt && (
            <p className="mt-1 text-[12px] text-[#6a6a6a]">
              Shipped {new Date(shippedAt).toLocaleString("nl-NL")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {needsShip && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setOpen(true)}
              className="admin-btn admin-btn-primary text-[12px]"
            >
              Ship
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen((v) => !v)}
            className="admin-btn admin-btn-ghost text-[12px]"
          >
            Edit
          </button>

          {open && (
            <form
              onSubmit={onSave}
              className="admin-card mt-2 w-full min-w-[280px] space-y-3 p-4 text-left sm:min-w-[320px]"
            >
              <label className="block">
                <span className="admin-label">Status</span>
                <select
                  name="status"
                  defaultValue={needsShip ? "shipped" : status === "delivered" ? "shipped" : status}
                  className="admin-input"
                >
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Carrier</span>
                <select
                  name="carrier"
                  defaultValue={carrier || "PostNL"}
                  className="admin-input"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Tracking number</span>
                <input
                  name="trackingNumber"
                  defaultValue={trackingNumber || ""}
                  placeholder="Enter tracking number"
                  className="admin-input"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="admin-label">Tracking URL</span>
                <input
                  name="trackingUrl"
                  defaultValue={trackingUrl || ""}
                  placeholder="https://"
                  className="admin-input"
                />
              </label>
              <label className="block">
                <span className="admin-label">Notes</span>
                <input
                  name="notes"
                  defaultValue={notes || ""}
                  placeholder="Optional note"
                  className="admin-input"
                />
              </label>
              {error && <p className="text-[12px] text-red-400">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="admin-btn admin-btn-ghost text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary text-[12px]"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
          {error && !open && (
            <p className="w-full text-right text-[12px] text-red-400">{error}</p>
          )}
        </div>
      </div>
    </article>
  );
}
