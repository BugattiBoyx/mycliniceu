import { ImageResponse } from "next/og";
import { MJ_BRAND_NAME } from "@/lib/mj/brand";
import { getMjSiteUrl } from "@/lib/mj/metadata";

export const OG_SIZE = { width: 1200, height: 630 };

const FOREST = "#0a280e";
const SAGE = "#e8efe4";
const MUTED = "rgba(10, 40, 14, 0.62)";

async function loadGoogleFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; OG/1.0)" } },
  ).then((res) => res.text());

  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!match?.[1]) {
    throw new Error(`Could not load font ${family}`);
  }

  return fetch(match[1]).then((res) => res.arrayBuffer());
}

export type ClinicOgProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  bullets?: string[];
  productImagePath?: string;
  badge?: string;
};

export async function renderClinicOgImage({
  eyebrow = "Online kliniek · Nederland",
  title,
  subtitle,
  bullets = ["BIG-geregistreerde artsen", "Gratis discrete levering"],
  productImagePath,
  badge,
}: ClinicOgProps) {
  const [lora, inter] = await Promise.all([
    loadGoogleFont("Lora", 600),
    loadGoogleFont("Inter", 500),
  ]);

  const productSrc = productImagePath
    ? `${getMjSiteUrl()}${productImagePath}`
    : `${getMjSiteUrl()}/products/ozempic-vs-mounjaro.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: SAGE,
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 64px",
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: "Lora",
              fontSize: 34,
              color: FOREST,
              letterSpacing: "-0.03em",
            }}
          >
            {MJ_BRAND_NAME}
          </div>
          {badge ? (
            <div
              style={{
                alignSelf: "flex-start",
                background: FOREST,
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: 8,
              }}
            >
              {badge}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: MUTED,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "Lora",
              fontSize: 52,
              lineHeight: 1.08,
              color: FOREST,
              letterSpacing: "-0.03em",
              maxWidth: 560,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.45,
              color: MUTED,
              maxWidth: 520,
            }}
          >
            {subtitle}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            {bullets.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ffffff",
                  color: FOREST,
                  fontSize: 16,
                  fontWeight: 500,
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(10, 40, 14, 0.1)",
                }}
              >
                <span style={{ color: FOREST, fontWeight: 700 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            width: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            padding: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productSrc}
            alt=""
            width={340}
            height={340}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Lora", data: lora, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
    },
  );
}
