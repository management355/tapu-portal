import { NextResponse } from "next/server";
import { getOrigin, normalizeShortId } from "@/lib/site";

// Kurzadresse eines Knopfes, wie sie im QR-Code und auf dem Chip steht (z. B. tapu.one/A7K2M9):
// leitet sofort auf die Scan-Seite weiter. Bei einer unbekannten Adresse zeigt die Scan-Seite
// ihren Hinweis „Nichts gefunden“.
export async function GET(_request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  const { shortId: raw } = await params;
  const target = normalizeShortId(raw) ?? encodeURIComponent(raw);
  return NextResponse.redirect(new URL(`/q/${target}`, await getOrigin()), 307);
}
