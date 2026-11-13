import Link from "next/link";

// Kopfzeile der inneren Seiten: Logo und Weg zurück zur Startseite.
export function SiteHead() {
  return (
    <div className="scan-head no-print">
      <Link href="/" className="scan-logo" aria-label="taPu, zur Startseite">taPu</Link>
      <Link href="/" className="button secondary small">Startseite</Link>
    </div>
  );
}
