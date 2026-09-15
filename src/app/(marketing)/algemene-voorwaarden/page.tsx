import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Algemene voorwaarden" };

export default function Page() {
  return (
    <LegalPage title="Algemene voorwaarden">
      <p>
        Deze algemene voorwaarden zijn van toepassing op elk gebruik van onze
        website en op alle bestellingen die via de website worden geplaatst.
      </p>
      <p>
        Door gebruik te maken van deze website gaat u akkoord met deze
        voorwaarden. Productinformatie wordt zo nauwkeurig mogelijk weergegeven.
        Bestellingen komen tot stand na succesvolle betaling.
      </p>
      <p>
        Levering volgt de verzendinformatiepagina. Retouren volgen het
        retourbeleid. Medicatie is alleen op recept en onder medisch toezicht.
      </p>
    </LegalPage>
  );
}
