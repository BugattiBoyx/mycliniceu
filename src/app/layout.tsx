import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { SessionProvider } from "@/components/admin/SessionProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Mosmo – Multi-store commerce",
    template: "%s – Mosmo",
  },
  description: "Multi-tenant commerce platform for merchant storefronts.",
  icons: {
    icon: "/brand/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The storefront tags <html> with a capability class before hydration.
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
