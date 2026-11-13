import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/supabase/env";
import { SiteHead } from "@/app/site-head";
import { login, signup } from "./actions";

const ERRORS: Record<string, string> = {
  login: "Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen. Noch kein Konto? Dann unten neu registrieren.",
  unconfirmed:
    "Deine E-Mail-Adresse ist noch nicht bestätigt. Bitte klicke auf den Link in der Mail, die wir dir geschickt haben, und melde dich danach an. Schau auch im Spam-Ordner nach.",
  signup: "Die Registrierung hat nicht geklappt. Bitte versuche es in ein paar Minuten noch einmal.",
  exists: "Zu dieser E-Mail-Adresse gibt es schon ein Konto. Bitte melde dich oben an.",
  wait: "Die Bestätigungs-Mail ist schon unterwegs. Bitte schau in dein Postfach (auch im Spam-Ordner). Eine neue Mail kannst du frühestens nach einer Minute anfordern.",
  password: "Das Passwort braucht mindestens 8 Zeichen.",
  callback: "Der Bestätigungslink ist ungültig oder abgelaufen. Registriere dich unten noch einmal, dann kommt eine neue Mail.",
};

const NOTICES: Record<string, string> = {
  confirm:
    "Fast geschafft: Wir haben dir eine Mail geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen. Das kann ein paar Minuten dauern; schau auch im Spam-Ordner nach.",
  confirmed: "Deine E-Mail-Adresse ist bestätigt. Melde dich jetzt mit E-Mail und Passwort an.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const { error, notice, next } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  // Wer schon angemeldet ist, muss sich nicht noch einmal anmelden.
  if (isConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(target);
  }
  return (
    <main>
      <SiteHead />
      <h1>Anmelden</h1>
      <p className="muted">Mit einem Konto verwaltest du deine Knöpfe und Botschaften.</p>
      {error && ERRORS[error] && <div className="card error" role="alert">{ERRORS[error]}</div>}
      {notice && NOTICES[notice] && <div className="card notice" role="status">{NOTICES[notice]}</div>}
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
        <div><button>Anmelden</button></div>
      </form>

      <h2>Neu hier? Konto anlegen</h2>
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
        <div><button className="secondary">Neu registrieren</button></div>
        <p className="muted small" style={{ margin: 0 }}>
          Danach bekommst du eine Mail mit einem Bestätigungslink. Erst nach dem Klick darauf kannst du dich anmelden.
        </p>
      </form>
      <p className="muted small">
        Mit der Registrierung akzeptierst du die <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>.
        Wie wir mit deinen Daten umgehen, steht in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
    </main>
  );
}
