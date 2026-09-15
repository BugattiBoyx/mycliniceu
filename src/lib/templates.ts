export type StoreTemplate = {
  id: string;
  name: string;
  description: string;
  preview: string;
  version: string;
  source: "system" | "upload";
  fileUrl?: string | null;
};

/** Built-in templates shipped with the platform */
export const TEMPLATES: StoreTemplate[] = [
  {
    id: "moun-journey",
    name: "The Clinic",
    description:
      "Dutch GLP-1 / pharmacy theme — editorial storefront, dosage selectors, checkout wired to platform payments.",
    preview: "/products/mounjaro-pen.png",
    version: "2.0",
    source: "system",
  },
];

export function getSystemTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Sync lookup for system templates only */
export function getTemplate(id: string) {
  return getSystemTemplate(id);
}

export function isValidSystemTemplateId(id: string) {
  return TEMPLATES.some((t) => t.id === id);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function themeSlugFromName(name: string) {
  const base = slugify(name) || `theme-${Date.now().toString(36)}`;
  return base.slice(0, 48);
}

export function listTemplates() {
  return TEMPLATES;
}
