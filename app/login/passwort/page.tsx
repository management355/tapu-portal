import Link from "next/link";
import { SiteHead } from "@/app/site-head";
import { requestPasswordReset } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  return (
    <main>
      <SiteHead back="/login" />
      <h1>Passwort vergessen</h1>
      {error === "link" && (
        <div className="card error" role="alert">
          Der Link ist ungültig oder abgelaufen. Fordere hier einen neuen an und öffne ihn im selben Browser.
        </div>
      )}
      {notice === "sent" ? (
        <div className="confirm-screen" role="status">
          <div className="confirm-icon" aria-hidden="true">✉</div>
          <h1>Schau in dein Postfach</h1>
          <p className="confirm-lead">
            Wenn es zu dieser Adresse ein Konto gibt, haben wir dir eine Mail mit einem Link geschickt. Darüber
            legst du ein neues Passwort fest.
          </p>
          <ul>
            <li>Die Mail kann ein paar Minuten brauchen. Schau auch im Spam-Ordner nach.</li>
            <li>Öffne den Link in diesem Browser auf diesem Gerät.</li>
          </ul>
        </div>
      ) : (
        <>
          <p className="muted">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, über den du ein neues Passwort festlegst.</p>
          <form className="card stack" action={requestPasswordReset}>
            <label>
              E-Mail
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <div><button>Link schicken</button></div>
          </form>
        </>
      )}
      <p><Link href="/login">Zurück zur Anmeldung</Link></p>
    </main>
  );
}
