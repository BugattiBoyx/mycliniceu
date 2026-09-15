import { getActiveStore } from "@/lib/active-store";
import { getTemplateAsync, listAllTemplates } from "@/lib/templates-server";
import { requireUser } from "@/lib/session";
import { ThemeCatalog } from "./ThemeCatalog";
import { ThemeUploadForm } from "./ThemeUploadForm";

export default async function StorefrontsPage() {
  const user = await requireUser();
  const { store } = await getActiveStore(user.id);
  const templates = await listAllTemplates();

  if (!store) {
    return (
      <div className="mx-auto max-w-[900px]">
        <h1 className="text-[28px] font-semibold tracking-tight text-white">
          Themes
        </h1>
        <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
          Create a store first, then choose or upload a theme.
        </p>
        <a
          href="/admin/storefronts/new"
          className="admin-btn admin-btn-primary mt-6 inline-flex"
        >
          Create store
        </a>
      </div>
    );
  }

  const current = await getTemplateAsync(store.templateId);

  return (
    <div className="mx-auto max-w-[900px]">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-white">
          Themes
        </h1>
        <p className="mt-1.5 text-[14px] text-[#8b8b8b]">
          Choose a system template or add a theme file for{" "}
          <span className="text-white">{store.name}</span>
        </p>
        <p className="mt-2 text-[13px] text-[#6a6a6a]">
          Active: {current.name} v{current.version}
          {current.source === "upload" ? " · uploaded" : " · system"}
        </p>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[14px] font-medium text-white">
          Choose template
        </h2>
        <ThemeCatalog
          storeId={store.id}
          currentTemplateId={store.templateId}
          templates={templates}
        />
      </section>

      <section className="mt-10">
        <ThemeUploadForm />
      </section>
    </div>
  );
}
