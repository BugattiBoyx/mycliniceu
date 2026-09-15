import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { MJ_BRAND_NAME } from "@/lib/mj/brand";

export const metadata: Metadata = { title: "Privacybeleid" };

export default function Page() {
  return (
    <LegalPage title="Privacybeleid">
      <p>
        {MJ_BRAND_NAME} verwerkt persoonsgegevens uitsluitend voor het uitvoeren
        van bestellingen, medische intake, klantenservice en wettelijke
        verplichtingen.
      </p>
      <p>
        Gegevens worden veilig opgeslagen en niet langer bewaard dan nodig. U
        heeft recht op inzage, correctie en verwijdering waar de wet dit toelaat.
      </p>
    </LegalPage>
  );
}
