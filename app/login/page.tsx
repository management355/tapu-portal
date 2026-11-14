import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/supabase/env";
import { SiteHead } from "@/app/site-head";
import { login, signup } from "./actions";

const ERRORS: Record<string, string> = {
  login: "Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen. Noch kein Konto? Dann wechsle zu „Konto erstellen“.",
  unconfirmed:
    "Deine E-Mail-Adresse ist noch nicht bestätigt. Bitte klicke auf den Link in der Mail, die wir dir geschickt haben, und melde dich danach an. Schau auch im Spam-Ordner nach.",
  signup: "Die Registrierung hat nicht geklappt. Bitte versuche es in ein paar Minuten noch einmal.",
  exists: "Zu dieser E-Mail-Adresse gibt es schon ein Konto. Bitte melde dich an.",
  wait: "Die Bestätigungs-Mail ist schon unterwegs. Bitte schau in dein Postfach (auch im Spam-Ordner). Eine neue Mail kannst du frühestens nach einer Minute anfordern.",
  password: "Das Passwort braucht mindestens 8 Zeichen.",
  callback: "Der Bestätigungslink ist ungültig oder abgelaufen. Registriere dich noch einmal, dann kommt eine neue Mail.",
};

const NOTICES: Record<string, string> = {
  confirm:
    "Fast geschafft: Wir haben dir eine Mail geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen. Das kann ein paar Minuten dauern; schau auch im Spam-Ordner nach.",
  confirmed: "Deine E-Mail-Adresse ist bestätigt. Melde dich jetzt mit E-Mail und Passwort an.",
  reset: "Dein neues Passwort ist gespeichert. Melde dich jetzt damit an.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string; ansicht?: string }>;
}) {
  const { error, notice, next, ansicht } = await searchParams;
  const isSignup = ansicht === "neu";
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  // Wer schon angemeldet ist, muss sich nicht noch einmal anmelden.
  if (isConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(target);
  }
  // Direkt nach der Registrierung: nur dieser eine Hinweis, groß und unübersehbar.
  if (notice === "confirm") {
    return (
      <main>
        <SiteHead back="/" />
        <div className="confirm-screen" role="status">
          <div className="confirm-icon" aria-hidden="true">✉</div>
          <h1>Bitte bestätige zuerst deine E-Mail-Adresse</h1>
          <p className="confirm-lead">
            Wir haben dir gerade eine Mail geschickt. Klicke auf den Link darin. Erst danach kannst du dich
            anmelden.
          </p>
          <ul>
            <li>Die Mail kann ein paar Minuten brauchen.</li>
            <li>Schau auch im Spam-Ordner nach. Der Absender lautet „Supabase Auth“.</li>
            <li>Öffne den Link am besten auf demselben Gerät, auf dem du dich registriert hast.</li>
          </ul>
          <p>
            <Link className="button" href={`/login?next=${encodeURIComponent(target)}`}>
              Ich habe bestätigt, weiter zur Anmeldung
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const nextParam = `next=${encodeURIComponent(target)}`;
  return (
    <main>
      <SiteHead back="/" />
      <nav className="tabs login-tabs" aria-label="Anmelden oder Konto erstellen">
        <Link href={`/login?${nextParam}`} aria-current={isSignup ? undefined : "page"}>Anmelden</Link>
        <Link href={`/login?ansicht=neu&${nextParam}`} aria-current={isSignup ? "page" : undefined}>Konto erstellen</Link>
      </nav>
      <h1>{isSignup ? "Konto erstellen" : "Anmelden"}</h1>
      <p className="muted">
        {isSignup
          ? "Mit einem Konto speicherst du deine Botschaften und bekommst deine eigenen QR-Codes."
          : "Mit deinem Konto verwaltest du deine Knöpfe und Botschaften."}
      </p>
      {error && ERRORS[error] && <div className="card error" role="alert">{ERRORS[error]}</div>}
      {notice && NOTICES[notice] && <div className="card notice" role="status">{NOTICES[notice]}</div>}

      {isSignup ? (
        <>
          <form className="card stack" action={signup}>
            <input type="hidden" name="next" value={target} />
            <label>
              E-Mail
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              Passwort wählen (mindestens 8 Zeichen)
              <input type="password" name="password" autoComplete="new-password" minLength={8} required />
            </label>
            <div><button>Konto erstellen</button></div>
            <p className="muted small" style={{ margin: 0 }}>
              Danach bekommst du eine Mail mit einem Bestätigungslink. Nach dem Klick darauf geht es dort weiter,
              wo du aufgehört hast.
            </p>
          </form>
          <p className="muted small">
            Mit der Registrierung akzeptierst du die <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>.
            Wie wir mit deinen Daten umgehen, steht in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
          </p>
          <p>Schon ein Konto? <Link href={`/login?${nextParam}`}>Anmelden</Link></p>
        </>
      ) : (
        <>
          <form className="card stack" action={login}>
            <input type="hidden" name="next" value={target} />
            <label>
              E-Mail
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              Passwort
              <input type="password" name="password" autoComplete="current-password" minLength={8} required />
            </label>
            <div className="row between">
              <button>Anmelden</button>
              <Link href="/login/passwort">Passwort vergessen?</Link>
            </div>
          </form>
          <p>Noch kein Konto? <Link href={`/login?ansicht=neu&${nextParam}`}>Konto erstellen</Link></p>
        </>
      )}
    </main>
  );
}
