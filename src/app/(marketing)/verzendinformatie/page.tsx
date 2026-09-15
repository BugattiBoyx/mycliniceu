import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Verzendinformatie" };

export default function Page() {
  return (
    <LegalPage title="Verzendinformatie">
      <p>Bestellingen worden verwerkt na succesvolle betaling (1–3 werkdagen).</p>
      <p>Binnen Europa: 5–10 werkdagen. Buiten Europa: 7–20 werkdagen.</p>
      <p>
        Bij verzending ontvangt u indien beschikbaar een trackingnummer per
        e-mail. Discrete levering via partnerapotheek.
      </p>
    </LegalPage>
  );
}
