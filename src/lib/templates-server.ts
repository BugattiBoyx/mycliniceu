import "server-only";

import { prisma } from "./db";
import {
  TEMPLATES,
  getSystemTemplate,
  isValidSystemTemplateId,
  type StoreTemplate,
} from "./templates";

export async function listAllTemplates(): Promise<StoreTemplate[]> {
  const uploaded = await prisma.theme.findMany({
    orderBy: { createdAt: "desc" },
  });
  return [
    ...TEMPLATES,
    ...uploaded.map((t) => ({
      id: t.slug,
      name: t.name,
      description: t.description || "Uploaded theme package",
      preview: t.previewUrl || "/products/mounjaro.png",
      version: t.version,
      source: "upload" as const,
      fileUrl: t.fileUrl,
    })),
  ];
}

export async function getTemplateAsync(id: string): Promise<StoreTemplate> {
  const system = TEMPLATES.find((t) => t.id === id);
  if (system) return system;
  const uploaded = await prisma.theme.findUnique({ where: { slug: id } });
  if (uploaded) {
    return {
      id: uploaded.slug,
      name: uploaded.name,
      description: uploaded.description || "Uploaded theme package",
      preview: uploaded.previewUrl || "/products/mounjaro.png",
      version: uploaded.version,
      source: "upload",
      fileUrl: uploaded.fileUrl,
    };
  }
  return getSystemTemplate(id);
}

export async function isValidTemplateId(id: string) {
  if (isValidSystemTemplateId(id)) return true;
  const uploaded = await prisma.theme.findUnique({ where: { slug: id } });
  return !!uploaded;
}
