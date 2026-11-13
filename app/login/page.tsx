import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/supabase/env";
import { SiteHead } from "@/app/site-head";
import { login, signup } from "./actions";

const ERRORS: Record<string, string> = {
  login: "Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.",
  signup: "Registrierung fehlgeschlagen. Vielleicht gibt es das Konto schon.",
  password: "Das Passwort braucht mindestens 8 Zeichen.",
  callback: "Die Anmeldung konnte nicht abgeschlossen werden. Der Link ist ungültig oder abgelaufen.",
};

const NOTICES: Record<string, string> = {
  confirm: "Fast geschafft: Bitte bestätige die E-Mail, die wir dir geschickt haben.",
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
      <form className="card stack">
        <input type="hidden" name="next" value={target} />
        <label>
          E-Mail
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Passwort
          <input type="password" name="password" autoComplete="current-password" minLength={8} required />
        </label>
        <div className="row">
          <button formAction={login}>Anmelden</button>
          <button className="secondary" formAction={signup}>Neu registrieren</button>
        </div>
      </form>
      <p className="muted small">
        Mit der Registrierung akzeptierst du die <Link href="/nutzungsbedingungen">Nutzungsbedingungen</Link>.
        Wie wir mit deinen Daten umgehen, steht in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
    </main>
  );
}
