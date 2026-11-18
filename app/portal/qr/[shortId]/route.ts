import QRCode from "qrcode";
import { getOrigin, normalizeShortId, scanLink } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

// Liefert den QR-Code eines eigenen Codes als SVG.
export async function GET(_request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  const { shortId: raw } = await params;
  const shortId = normalizeShortId(raw);
  if (!shortId) return new Response("Not found", { status: 404 });

  const supabase = await createClient();
  // Die Zugriffsregeln lassen nur eigene Codes durch.
  const { data } = await supabase.from("codes").select("short_id").eq("short_id", shortId).maybeSingle();
  if (!data) return new Response("Not found", { status: 404 });

  const link = scanLink(await getOrigin(), shortId);
  // Die kurze Adresse lässt Platz für mehr Fehlerkorrektur: Der Code bleibt lesbar, auch wenn der Knopf verkratzt.
  const svg = await QRCode.toString(link.qr, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: link.compact ? "Q" : "M",
  });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, max-age=300" },
  });
}
