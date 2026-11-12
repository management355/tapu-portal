import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: `Impressum – ${OPERATOR.product}` };

export default function ImpressumPage() {
  return (
    <main className="legal">
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <address>
        {OPERATOR.name}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
        <br />
        {OPERATOR.country}
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Inhalte von Nutzern</h2>
      <p>
        Über {OPERATOR.product} hinterlegen Nutzer eigene Botschaften. Für diese Inhalte sind die
        jeweiligen Nutzer verantwortlich. Rechtswidrige Inhalte kannst du über „Inhalt melden“ auf der
        jeweiligen Seite oder per E-Mail melden. Wir prüfen Meldungen und sperren Inhalte, die gegen
        Gesetze oder unsere <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link> verstoßen.
      </p>

      <p className="small"><Link href="/">Zur Startseite</Link></p>
    </main>
  );
}
