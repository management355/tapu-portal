import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = { title: `Datenschutz – ${OPERATOR.product}` };

export default function DatenschutzPage() {
  return (
    <main className="legal">
      <h1>Datenschutzerklärung</h1>
      <p className="muted small">Stand: {OPERATOR.legalDate}</p>

      <h2>1. Verantwortlicher</h2>
      <address>
        {OPERATOR.name}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
        <br />
        E-Mail: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
      </address>

      <h2>2. Was {OPERATOR.product} ist</h2>
      <p>
        Mit {OPERATOR.product} hinterlegst du eine Botschaft hinter einem Knopf oder einem QR-Code. Wer den
        Knopf antippt oder den Code scannt, sieht diese Botschaft.
      </p>

      <h2>3. Welche Daten wir verarbeiten</h2>

      <h3>Aufruf der Seiten</h3>
      <p>
        Beim Aufruf verarbeitet unser Hosting-Dienst technisch notwendige Daten, etwa IP-Adresse,
        Zeitpunkt, aufgerufene Adresse und Browsertyp, um die Seite auszuliefern und Angriffe abzuwehren.
        Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO. Unser Interesse ist der sichere Betrieb.
      </p>

      <h3>Konto</h3>
      <p>
        Für ein Konto speichern wir deine E-Mail-Adresse, ein verschlüsselt abgelegtes Passwort, optional
        einen Anzeigenamen sowie deine Stufe und Spracheinstellung. Zur Bestätigung der Adresse erhältst du
        eine E-Mail. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO (Nutzungsvertrag).
      </p>

      <h3>Knöpfe, Codes und Botschaften</h3>
      <p>
        Wir speichern, welche Knöpfe und Codes zu deinem Konto gehören, und die Botschaften, die du
        hinterlegst: Texte sowie hochgeladene Bilder, Audio- und Videodateien. Rechtsgrundlage ist Art. 6
        Abs. 1 Buchst. b DSGVO.
      </p>
      <p>
        <strong>Wichtig:</strong> Eine hinterlegte Botschaft sieht jede Person, die den Knopf antippt, den
        Code scannt oder die zugehörige Adresse kennt. Hinterlege keine Inhalte, die nicht für diese
        Personen bestimmt sind, und keine Daten anderer Menschen ohne deren Einverständnis.
      </p>

      <h3>Zählung der Aufrufe</h3>
      <p>
        Bei jedem Aufruf eines Knopfes oder Codes zählen wir den Aufruf mit Zeitpunkt und Geräteklasse
        (iOS, Android, Desktop oder Sonstiges). Wir speichern dabei keine IP-Adresse und erstellen keine
        Profile. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. f DSGVO. Unser Interesse ist eine einfache
        Nutzungsstatistik.
      </p>

      <h3>Meldungen</h3>
      <p>
        Wenn du einen Inhalt meldest, speichern wir die Meldung und deinen optionalen Hinweistext, um den
        Inhalt zu prüfen. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. c und f DSGVO.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Wir setzen nur Cookies, die für die Anmeldung technisch notwendig sind (§ 25 Abs. 2 Nr. 2 TDDDG).
        Es gibt keine Werbe- oder Analyse-Cookies und keine Einbindung von Tracking-Diensten.
      </p>

      <h2>5. Empfänger und Dienstleister</h2>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> (USA): Datenbank, Anmeldung und Dateispeicher. Die Daten liegen in
          einem Rechenzentrum in der Europäischen Union (Region Stockholm).
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA): Hosting und Auslieferung der Webseiten.
        </li>
      </ul>
      <p>
        Mit den Dienstleistern bestehen Verträge zur Auftragsverarbeitung. Soweit dabei Daten in die USA
        übermittelt werden, geschieht das auf Grundlage geeigneter Garantien nach Art. 44 ff. DSGVO.
      </p>

      <h2>6. Speicherdauer</h2>
      <p>
        Wir speichern deine Daten, solange dein Konto besteht. Du kannst dein Konto jederzeit im Portal
        unter „Konto“ löschen. Dabei werden dein Profil, deine Botschaften und deine hochgeladenen Dateien
        gelöscht. Einzelne Botschaften kannst du jederzeit selbst löschen. Die Aufrufzählung enthält keine
        Angaben zu deiner Person.
      </p>

      <h2>7. Deine Rechte</h2>
      <p>Du hast das Recht auf</p>
      <ul>
        <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO).</li>
      </ul>
      <p>
        Schreib uns dazu an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Außerdem kannst du
        dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Landesbeauftragten für
        den Datenschutz und die Informationsfreiheit Baden-Württemberg.
      </p>

      <h2>8. Änderungen</h2>
      <p>
        Wenn sich das Angebot ändert, passen wir diese Erklärung an. Es gilt die jeweils hier
        veröffentlichte Fassung.
      </p>

      <p className="small"><Link href="/">Zur Startseite</Link></p>
    </main>
  );
}
