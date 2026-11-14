import { redirect } from "next/navigation";
import { SiteHead } from "@/app/site-head";
import { isConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { setNewPassword } from "../actions";

const ERRORS: Record<string, string> = {
  password: "Das Passwort braucht mindestens 8 Zeichen.",
  same: "Das ist dein bisheriges Passwort. Bitte wähle ein anderes.",
  save: "Das Passwort konnte nicht gespeichert werden. Bitte versuche es noch einmal.",
};

export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!isConfigured()) redirect("/");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  // Ohne den Link aus der Mail gibt es hier nichts zu tun.
  if (!data.user) redirect("/login/passwort?error=link");

  return (
    <main>
      <SiteHead />
      <h1>Neues Passwort</h1>
      <p className="muted">Für das Konto {data.user.email}.</p>
      {error && ERRORS[error] && <div className="card error" role="alert">{ERRORS[error]}</div>}
      <form className="card stack" action={setNewPassword}>
        <label>
          Neues Passwort (mindestens 8 Zeichen)
          <input type="password" name="password" autoComplete="new-password" minLength={8} required />
        </label>
        <div><button>Passwort speichern</button></div>
      </form>
    </main>
  );
}
