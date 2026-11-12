import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="legal-footer">
      <Link href="/impressum">Impressum</Link>
      <Link href="/datenschutz">Datenschutz</Link>
      <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>
    </footer>
  );
}
