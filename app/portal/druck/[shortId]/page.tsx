import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAccount } from "@/lib/account";
import { getOrigin, normalizeShortId } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { SiteHead } from "@/app/site-head";
import { PrintSheet } from "./print-sheet";

export const metadata: Metadata = { title: "taPu – QR-Code drucken", robots: { index: false, follow: false } };

// Druckansicht: QR-Code mit taPu-Logo und Nummer, in wählbarer Größe.
export default async function PrintPage({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId: raw } = await params;
  const shortId = normalizeShortId(raw);
  if (!shortId) notFound();

  const account = await getAccount();
  if (!account) redirect(`/login?next=/portal/druck/${shortId}`);

  const supabase = await createClient();
  // Die Zugriffsregeln lassen nur eigene Codes durch.
  const { data } = await supabase.from("codes").select("short_id, title, pin_required").eq("short_id", shortId).maybeSingle();
  if (!data) notFound();

  const origin = await getOrigin();
  const label = `${shortId.slice(0, 5)}·${shortId.slice(5)}`.toUpperCase();

  return (
    <main className="print-page">
      <SiteHead />
      <p className="small no-print"><Link href="/portal">Zurück zu meinen Knöpfen</Link></p>
      <h1 className="no-print">QR-Code drucken</h1>
      {data.title && <p className="muted no-print">{data.title}</p>}
      <PrintSheet logo={data.pin_required ? "xtaPux" : "taPu"} qrSrc={`/portal/qr/${shortId}`} label={label} link={`${origin.replace(/^https?:\/\//, "")}/q/${shortId}`} />
    </main>
  );
}
