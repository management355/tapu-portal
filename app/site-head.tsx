import Link from "next/link";
import { BackButton } from "./back-button";

// Kopfzeile der inneren Seiten: Logo und Weg zurück zur Startseite. Mit back gibt es zusätzlich
// die Schaltfläche "Zurück"; der Wert ist das Ziel, falls es keinen Verlauf gibt.
export function SiteHead({ back }: { back?: string }) {
  return (
    <div className="scan-head no-print">
      <div className="row">
        {back && <BackButton fallback={back} label="Zurück" />}
        <Link href="/" className="scan-logo" aria-label="taPu, zur Startseite">taPu</Link>
      </div>
      <Link href="/" className="button secondary small">Startseite</Link>
    </div>
  );
}
