import { NextResponse } from "next/server";
import { isLang } from "@/lib/i18n";
import { getOrigin } from "@/lib/site";

// Speichert die gewählte Sprache und führt zurück zur Startseite.
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/", await getOrigin()), 303);
  if (isLang(code)) {
    response.cookies.set("lang", code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}
