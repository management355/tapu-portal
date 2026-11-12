import Link from "next/link";
import { getLang, landingStrings } from "@/lib/i18n";

export async function LegalFooter() {
  const t = landingStrings(await getLang());
  return (
    <footer className="legal-footer">
      <div className="legal-footer-inner">
        <Link href="/" className="legal-footer-logo">taPu</Link>
        <nav aria-label="Rechtliches">
          <Link href="/impressum">{t.imprint}</Link>
          <Link href="/datenschutz">{t.privacy}</Link>
          <Link href="/nutzungsbedingungen">{t.terms}</Link>
        </nav>
      </div>
    </footer>
  );
}
