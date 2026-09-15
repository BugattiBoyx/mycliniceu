import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { MJ_BRAND_EMAIL } from "@/lib/mj/brand";

export const metadata: Metadata = { title: "Retourbeleid" };

export default function Page() {
  return (
    <LegalPage title="Retourbeleid">
      <p>
        Voor medicatie gelden specifieke wettelijke beperkingen op retouren.
        Neem contact met ons op via {MJ_BRAND_EMAIL} voor vragen over uw
        bestelling.
      </p>
      <p>
        Terugbetalingen worden verwerkt via de oorspronkelijke betaalmethode
        volgens dit beleid.
      </p>
    </LegalPage>
  );
}
