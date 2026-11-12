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
    redirect(`/login?error=login&next=${encodeURIComponent(next)}`);
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
    redirect(`/login?error=signup&next=${encodeURIComponent(next)}`);
  }
  // Ohne E-Mail-Bestaetigung ist man sofort angemeldet, sonst kommt eine Mail.
  if (data.session) redirect(next);
  redirect(`/login?notice=confirm&next=${encodeURIComponent(next)}`);
}
