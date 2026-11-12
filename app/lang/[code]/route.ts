import { NextResponse } from "next/server";
import { isLang } from "@/lib/i18n";
import { getOrigin } from "@/lib/site";

// Speichert die gewählte Sprache und führt zurück zur Startseite oder zur angegebenen eigenen Seite.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  // Rücksprung nur auf eigene Seiten (Pfad beginnt mit genau einem Schrägstrich).
  const wanted = new URL(request.url).searchParams.get("next") ?? "/";
  const next = /^\/(?![\/\\])/.test(wanted) ? wanted : "/";
  const response = NextResponse.redirect(new URL(next, await getOrigin()), 303);
  if (isLang(code)) {
    response.cookies.set("lang", code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}
