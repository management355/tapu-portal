import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Ziel des Bestaetigungslinks aus der Registrierungs-Mail.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/portal";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  // Der Link aus der Mail bestätigt die Adresse schon bei Supabase. Wird er in einem anderen
  // Browser oder auf einem anderen Gerät geöffnet als die Registrierung, klappt nur die
  // automatische Anmeldung nicht. Dann genügt es, sich normal anzumelden.
  const failed = url.searchParams.get("error_code") ?? url.searchParams.get("error");
  const target = failed || !code ? "/login?error=callback" : `/login?notice=confirmed&next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(target, url.origin));
}
