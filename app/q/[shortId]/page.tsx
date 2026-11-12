import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { MediaView } from "@/app/media-view";
import { ARCHIVE_BUCKET, USER_BUCKET } from "@/lib/media";
import { signedUrl } from "@/lib/media-server";
import { normalizeShortId } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportContent } from "./actions";

// Scan-Seite: wird beim Antippen des Knopfes oder Scannen des Codes geoeffnet.
// Sie ist ohne Anmeldung erreichbar und gibt nur den hinterlegten Inhalt heraus.

export const metadata: Metadata = {
  title: "Tapu",
  robots: { index: false, follow: false },
};

type Shown =
  | { state: "unavailable" | "config" | "empty" }
  | { state: "unclaimed"; shortId: string }
  | {
      state: "content";
      shortId: string;
      title: string | null;
      body: string | null;
      mediaPath: string | null;
      mediaUrl: string | null;
      reportable: boolean;
    };

function deviceClass(userAgent: string): "ios" | "android" | "desktop" | "other" {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  if (/windows|macintosh|linux/i.test(userAgent)) return "desktop";
  return "other";
}

async function load(rawId: string): Promise<Shown> {
  const shortId = normalizeShortId(rawId);
  if (!shortId) return { state: "unavailable" };

  const admin = createAdminClient();
  if (!admin) return { state: "config" };

  const { data: code } = await admin
    .from("codes")
    .select("id, owner_id, is_active, target_type, message_id, archive_item_id")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!code || !code.is_active) return { state: "unavailable" };

  const userAgent = (await headers()).get("user-agent") ?? "";
  await admin.from("scans").insert({ code_id: code.id, device_class: deviceClass(userAgent) });

  if (!code.owner_id) return { state: "unclaimed", shortId };

  if (code.target_type === "archive" && code.archive_item_id) {
    const { data } = await admin
      .from("archive_items")
      .select("title, body, media_path")
      .eq("id", code.archive_item_id)
      .eq("is_published", true)
      .maybeSingle();
    if (data) {
      return {
        state: "content",
        shortId,
        title: data.title,
        body: data.body,
        mediaPath: data.media_path,
        mediaUrl: await signedUrl(ARCHIVE_BUCKET, data.media_path),
        reportable: false,
      };
    }
  }
  if (code.target_type === "message" && code.message_id) {
    const { data } = await admin
      .from("messages")
      .select("body, media_path")
      .eq("id", code.message_id)
      .eq("status", "published")
      .maybeSingle();
    if (data) {
      return {
        state: "content",
        shortId,
        title: null,
        body: data.body,
        mediaPath: data.media_path,
        mediaUrl: await signedUrl(USER_BUCKET, data.media_path),
        reportable: true,
      };
    }
  }
  return { state: "empty" };
}

export default async function ScanPage({
  params,
  searchParams,
}: {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ gemeldet?: string }>;
}) {
  const { shortId } = await params;
  const { gemeldet } = await searchParams;
  const shown = await load(shortId);

  return (
    <main>
      <div className="face" aria-hidden="true">:x</div>
      {shown.state === "content" && (
        <>
          {shown.title && <h1>{shown.title}</h1>}
          <MediaView path={shown.mediaPath} url={shown.mediaUrl} label={shown.title ?? "Hinterlegte Datei"} />
          {shown.body && <p className="message-body">{shown.body}</p>}
          {gemeldet && (
            <div className="card notice" role="status">Danke, die Meldung ist angekommen.</div>
          )}
          {shown.reportable && !gemeldet && (
            <details style={{ marginTop: "3rem" }}>
              <summary>Inhalt melden</summary>
              <form className="stack" action={reportContent} style={{ marginTop: "0.75rem" }}>
                <input type="hidden" name="short_id" value={shown.shortId} />
                <label>
                  Was stimmt mit diesem Inhalt nicht? (optional)
                  <textarea name="reason" maxLength={1000} />
                </label>
                <div><button className="secondary">Meldung abschicken</button></div>
              </form>
            </details>
          )}
        </>
      )}
      {shown.state === "empty" && (
        <>
          <h1>Hier ist noch nichts hinterlegt</h1>
          <p className="muted">Der Besitzer dieses Knopfes hat noch keine Botschaft ausgewählt.</p>
        </>
      )}
      {shown.state === "unclaimed" && (
        <>
          <h1>Dieser Knopf wartet auf dich</h1>
          <p className="muted">Übernimm ihn in dein Konto und hinterlege deine erste Botschaft.</p>
          <Link className="button" href={`/portal?claim=${shown.shortId}`}>Knopf übernehmen</Link>
        </>
      )}
      {shown.state === "unavailable" && (
        <>
          <h1>Nichts gefunden</h1>
          <p className="muted">Diese Adresse gehört zu keinem aktiven Knopf.</p>
        </>
      )}
      {shown.state === "config" && (
        <div className="card error">
          Die Scan-Seite ist noch nicht eingerichtet. Es fehlt die Angabe SUPABASE_SECRET_KEY.
        </div>
      )}
    </main>
  );
}
