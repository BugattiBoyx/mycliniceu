import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { themeSlugFromName } from "@/lib/templates";

const ALLOWED_THEME = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "text/html",
  "text/css",
  "application/json",
]);

const ALLOWED_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const themes = await prisma.theme.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(themes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const themeFile = form.get("themeFile");
  const previewFile = form.get("previewFile");

  if (!name) {
    return NextResponse.json({ error: "Theme name required" }, { status: 400 });
  }
  if (!(themeFile instanceof File) || themeFile.size === 0) {
    return NextResponse.json(
      { error: "Upload a theme file (ZIP, HTML, CSS, or JSON)" },
      { status: 400 },
    );
  }

  const themeType = themeFile.type || "application/octet-stream";
  const themeName = themeFile.name.toLowerCase();
  const themeOk =
    ALLOWED_THEME.has(themeType) ||
    themeName.endsWith(".zip") ||
    themeName.endsWith(".html") ||
    themeName.endsWith(".css") ||
    themeName.endsWith(".json");
  if (!themeOk) {
    return NextResponse.json(
      { error: "Theme file must be ZIP, HTML, CSS, or JSON" },
      { status: 400 },
    );
  }
  if (themeFile.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Theme file must be 25MB or smaller" }, { status: 400 });
  }

  let slug = themeSlugFromName(name);
  const taken = await prisma.theme.findUnique({ where: { slug } });
  if (taken || slug === "moun-journey") {
    slug = `${slug}-${nanoid(4)}`;
  }

  const dir = path.join(process.cwd(), "public", "themes", slug);
  await mkdir(dir, { recursive: true });

  const themeExt = themeName.includes(".")
    ? themeName.split(".").pop()!
    : "zip";
  const themeBytes = Buffer.from(await themeFile.arrayBuffer());
  const themeRel = `/themes/${slug}/theme.${themeExt}`;
  await writeFile(path.join(dir, `theme.${themeExt}`), themeBytes);

  let previewRel = "/products/mounjaro.png";
  if (previewFile instanceof File && previewFile.size > 0) {
    if (!ALLOWED_IMAGE.has(previewFile.type)) {
      return NextResponse.json(
        { error: "Preview must be JPG, PNG, WEBP, or GIF" },
        { status: 400 },
      );
    }
    const pExt =
      previewFile.type.includes("png")
        ? "png"
        : previewFile.type.includes("webp")
          ? "webp"
          : previewFile.type.includes("gif")
            ? "gif"
            : "jpg";
    const previewBytes = Buffer.from(await previewFile.arrayBuffer());
    await writeFile(path.join(dir, `preview.${pExt}`), previewBytes);
    previewRel = `/themes/${slug}/preview.${pExt}`;
  }

  const theme = await prisma.theme.create({
    data: {
      slug,
      name,
      description: description || null,
      previewUrl: previewRel,
      fileUrl: themeRel,
      version: "1.0",
      source: "upload",
    },
  });

  return NextResponse.json(theme);
}
