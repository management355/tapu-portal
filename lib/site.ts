import { headers } from "next/headers";

// Adresse, unter der die Seite gerade aufgerufen wird (fuer Links und QR-Codes).
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Kennung eines Knopfes: 6 Zeichen ohne die verwechselbaren 0/O und 1/I/L.
// Die ersten Knöpfe haben noch 10 Zeichen und bleiben gültig.
const SHORT_ID = /^(?:[a-hjkmnp-z2-9]{6}|[a-z2-9]{10})$/;

// Groß- und Kleinschreibung zählen nicht: Im QR-Code steht die Kennung groß, gespeichert ist sie klein.
export function normalizeShortId(raw: string): string | null {
  const id = raw.trim().toLowerCase();
  return SHORT_ID.test(id) ? id : null;
}

// Schreibweise auf Knopf und Ausdruck: groß, in der Mitte geteilt (A7K·2M9).
export function formatShortId(shortId: string): string {
  const half = Math.ceil(shortId.length / 2);
  return `${shortId.slice(0, half)}·${shortId.slice(half)}`.toUpperCase();
}

// Kurzadresse für Knöpfe und QR-Codes, z. B. "tapu.one". Ohne Angabe gilt die Adresse des Portals.
function shortLinkHost(): string | null {
  const host = (process.env.SHORT_LINK_HOST ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : null;
}

// Adresse, die ein Knopf öffnet. "qr" ist der Text im QR-Code: Mit Kurzadresse steht er komplett
// groß, weil reine Großschrift im QR-Code weniger Platz braucht und der Code so kleiner ausfällt.
export function scanLink(origin: string, shortId: string): { url: string; display: string; qr: string; compact: boolean } {
  const host = shortLinkHost();
  if (!host) {
    const url = `${origin}/q/${shortId}`;
    return { url, display: url.replace(/^https?:\/\//, ""), qr: url, compact: false };
  }
  const id = shortId.toUpperCase();
  return {
    url: `https://${host}/${id}`,
    display: `${host}/${id}`,
    qr: `HTTPS://${host.toUpperCase()}/${id}`,
    compact: true,
  };
}
