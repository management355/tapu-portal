import { headers } from "next/headers";

// Adresse, unter der die Seite gerade aufgerufen wird (fuer Links und QR-Codes).
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const SHORT_ID = /^[a-z2-9]{10}$/;

export function normalizeShortId(raw: string): string | null {
  const id = raw.trim().toLowerCase();
  return SHORT_ID.test(id) ? id : null;
}
