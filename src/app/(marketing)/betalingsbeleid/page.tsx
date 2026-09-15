import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Betalingsbeleid" };

export default function Page() {
  return (
    <LegalPage title="Betalingsbeleid">
      <p>
        Wij bieden veilige betaalmethoden: creditcard, debitcard en online
        betaalproviders. Betalingen verlopen via PCI-conforme gateways.
      </p>
      <p>
        Bestellingen worden pas verwerkt nadat de betaling succesvol is
        ontvangen. Prijzen worden weergegeven in euro.
      </p>
    </LegalPage>
  );
}
