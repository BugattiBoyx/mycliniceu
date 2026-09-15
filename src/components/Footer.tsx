import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/content";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/winkel", label: "Winkel" },
      { href: "/product/mounjaro-injectiepen-kopen", label: "Mounjaro" },
      { href: "/product/ozempic-injectiepen-kopen", label: "Ozempic" },
    ],
  },
  {
    title: "Informatie",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/verzendinformatie", label: "Verzendinformatie" },
      { href: "/retourbeleid", label: "Retourbeleid" },
      { href: "/betalingsbeleid", label: "Betalingsbeleid" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
      { href: "/privacybeleid", label: "Privacybeleid" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-brand text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-6">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
            Wetenschappelijk bewezen GLP-1 behandelingen met Nederlandse artsen,
            discrete levering en persoonlijke begeleiding.
          </p>
          <Image
            src="/brand/payment.png"
            alt="Betaalmethoden"
            width={220}
            height={28}
            className="mt-5 h-6 w-auto opacity-90"
          />
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold tracking-[0.16em] text-white/50 uppercase">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/50 md:px-6">
        {site.copyright} · Alleen op recept · Medisch toezicht verplicht
      </div>
    </footer>
  );
}
