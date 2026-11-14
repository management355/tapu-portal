import { BackButton } from "@/app/back-button";
import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: `Nutzungsbedingungen – ${OPERATOR.product}` };

export default function NutzungsbedingungenPage() {
  return (
    <main className="legal">
      <p className="back-row"><BackButton fallback="/" label="Zurück" /></p>
      <h1>Nutzungsbedingungen</h1>
      <p className="muted small">Stand: {OPERATOR.legalDate}</p>

      <h2>1. Anbieter und Angebot</h2>
      <p>
        {OPERATOR.product} wird von {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}, betrieben. Über
        das Portal hinterlegst du Botschaften hinter Knöpfen und QR-Codes. Die Nutzung ist derzeit
        kostenlos. Das Angebot befindet sich in einer Testphase.
      </p>

      <h2>2. Konto</h2>
      <ul>
        <li>Für das Hinterlegen von Botschaften brauchst du ein Konto. Du musst mindestens 16 Jahre alt sein.</li>
        <li>Halte dein Passwort geheim. Für Handlungen über dein Konto bist du verantwortlich.</li>
        <li>Pro Konto steht eine begrenzte Zahl von Knöpfen, Codes und Speicherplatz zur Verfügung.</li>
      </ul>

      <h2>3. Deine Inhalte</h2>
      <p>
        Du bleibst Inhaber deiner Inhalte. Du räumst uns das Recht ein, sie zu speichern und den Personen
        anzuzeigen, die deinen Knopf antippen oder deinen Code scannen. Dieses Recht endet, wenn du den
        Inhalt oder dein Konto löschst.
      </p>
      <p>Nicht erlaubt sind Inhalte, die</p>
      <ul>
        <li>gegen Gesetze verstoßen,</li>
        <li>Rechte anderer verletzen, etwa Urheber-, Marken- oder Persönlichkeitsrechte,</li>
        <li>andere beleidigen, bedrohen, belästigen oder zu Hass und Gewalt aufrufen,</li>
        <li>pornografisch oder jugendgefährdend sind,</li>
        <li>persönliche Daten anderer ohne deren Einverständnis enthalten,</li>
        <li>Schadsoftware verbreiten oder zu Betrug dienen.</li>
      </ul>

      <h2>4. Meldungen und Sperrung</h2>
      <p>
        Jeder kann einen Inhalt über „Inhalt melden“ melden. Wir prüfen Meldungen und dürfen Inhalte
        sperren oder löschen, die gegen diese Bedingungen verstoßen. Bei schweren oder wiederholten
        Verstößen dürfen wir das Konto sperren.
      </p>

      <h2>5. Knöpfe und Codes</h2>
      <p>
        Ein Knopf, der noch niemandem gehört, wird dem Konto zugeordnet, das ihn als erstes übernimmt.
        Löschst du dein Konto, werden deine Knöpfe wieder frei und zeigen keine Botschaft mehr.
      </p>

      <h2>6. Verfügbarkeit</h2>
      <p>
        Wir bemühen uns um einen störungsfreien Betrieb, sichern aber keine bestimmte Verfügbarkeit zu.
        In der Testphase können Funktionen geändert oder eingestellt werden. Bewahre wichtige Dateien
        zusätzlich an anderer Stelle auf.
      </p>

      <h2>7. Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Schäden an Leben, Körper
        und Gesundheit. Bei leichter Fahrlässigkeit haften wir nur für die Verletzung wesentlicher
        Pflichten und begrenzt auf den vorhersehbaren, typischen Schaden. Die Haftung nach dem
        Produkthaftungsgesetz bleibt unberührt.
      </p>

      <h2>8. Beendigung</h2>
      <p>
        Du kannst dein Konto jederzeit im Portal unter „Konto“ löschen. Wir können das Angebot mit einer
        Frist von vier Wochen einstellen und informieren dich darüber per E-Mail.
      </p>

      <h2>9. Änderungen und Recht</h2>
      <p>
        Über wesentliche Änderungen dieser Bedingungen informieren wir dich per E-Mail. Es gilt deutsches
        Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzlandes bleiben anwendbar.
      </p>

      <p>
        Fragen? Schreib an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
      </p>
      <p className="small"><Link href="/">Zur Startseite</Link></p>
    </main>
  );
}
