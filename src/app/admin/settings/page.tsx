import Link from "next/link";
import { getActiveStore } from "@/lib/active-store";
import { requireUser } from "@/lib/session";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  if (!store) return <p className="text-[#8b8b8b]">No store selected</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[28px] font-semibold tracking-tight">Store settings</h1>
      <p className="mt-1.5 text-[14px] text-[#8b8b8b]">{store.name}</p>
      <p className="mt-3 text-[13px] text-[#8b8b8b]">
        High-risk processors, crypto, and bank transfer live under{" "}
        <Link href="/admin/payments" className="text-[#93c5fd] hover:underline">
          Payments
        </Link>
        .
      </p>
      <div className="admin-card mt-6 p-5">
        <SettingsForm
          store={{
            id: store.id,
            name: store.name,
            contactEmail: store.contactEmail || "",
            tagline: store.tagline || "",
            description: store.description || "",
            brandColor: store.brandColor,
            legalPrivacy: store.legalPrivacy || "",
            legalTerms: store.legalTerms || "",
          }}
        />
      </div>
    </div>
  );
}
