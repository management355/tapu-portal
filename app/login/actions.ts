"use server";

import { redirect } from "next/navigation";
import { getOrigin } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

// Nur interne Ziele zulassen, damit niemand ueber den Login weitergeleitet wird.
function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Häufigster Fall bei neuen Nutzern: registriert, aber die Mail noch nicht bestätigt.
    const reason = error.code === "email_not_confirmed" ? "unconfirmed" : "login";
    redirect(`/login?error=${reason}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function signup(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const { email, password } = readCredentials(formData);
  if (password.length < 8) {
    redirect(`/login?error=password&next=${encodeURIComponent(next)}`);
  }
  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    const reason =
      error.code === "over_email_send_rate_limit"
        ? "wait"
        : error.code === "user_already_exists"
          ? "exists"
          : error.code === "weak_password"
            ? "password"
            : "signup";
    redirect(`/login?error=${reason}&next=${encodeURIComponent(next)}`);
  }
  // Ohne E-Mail-Bestaetigung ist man sofort angemeldet, sonst kommt eine Mail.
  if (data.session) redirect(next);
  // Gibt es das Konto schon, meldet Supabase keinen Fehler, liefert aber keine Identität.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    redirect(`/login?error=exists&next=${encodeURIComponent(next)}`);
  }
  redirect(`/login?notice=confirm&next=${encodeURIComponent(next)}`);
}
