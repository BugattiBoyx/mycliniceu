import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosted (Docker/Hetzner) builds need a standalone server bundle.
  // Vercel builds keep the default output.
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  outputFileTracingIncludes: {
    "/**": ["./prisma/schema.prisma"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
