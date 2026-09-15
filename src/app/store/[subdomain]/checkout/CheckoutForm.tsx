"use client";

import { FormEvent, useState } from "react";

type PayMethod = {
  type: string;
  name: string;
  isDefault: boolean;
};

export function CheckoutForm({
  storeId,
  brandColor,
  basePath,
  methods,
}: {
  storeId: string;
  brandColor: string;
  basePath: string;
  methods: PayMethod[];
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultType =
    methods.find((m) => m.isDefault)?.type || methods[0]?.type || "demo";
  const [paymentMethod, setPaymentMethod] = useState(defaultType);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        email: fd.get("email"),
        name: fd.get("name"),
        phone: fd.get("phone"),
        address: fd.get("address"),
        city: fd.get("city"),
        zip: fd.get("zip"),
        country: fd.get("country"),
        discountCode: fd.get("discountCode"),
        paymentMethod,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Checkout failed");
      return;
    }
    window.location.href = data.url || `${basePath}/checkout/success`;
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm font-medium">
        Name
        <input
          name="name"
          required
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Phone
        <input
          name="phone"
          type="tel"
          required
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Address
        <input
          name="address"
          required
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Postal code
          <input
            name="zip"
            required
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          City
          <input
            name="city"
            required
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Country
        <select
          name="country"
          defaultValue="NL"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5"
        >
          <option value="NL">Netherlands</option>
          <option value="BE">Belgium</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Discount code
        <input
          name="discountCode"
          placeholder="WELCOME10"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 uppercase"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Payment method</legend>
        <div className="mt-2 space-y-2">
          {methods.map((m) => (
            <label
              key={m.type}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                paymentMethod === m.type
                  ? "border-[color:var(--brand)] bg-black/[0.02]"
                  : "border-black/10 bg-white"
              }`}
              style={
                paymentMethod === m.type
                  ? { borderColor: brandColor }
                  : undefined
              }
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === m.type}
                onChange={() => setPaymentMethod(m.type)}
              />
              <span className="font-medium">{m.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || methods.length === 0}
        className="w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: brandColor }}
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}
