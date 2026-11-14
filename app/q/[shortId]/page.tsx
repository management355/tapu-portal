import { BackButton } from "@/app/back-button";
import type { Metadata } from "next";
import { isUnlocked, unlockCookieName } from "@/lib/pin";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { MediaView } from "@/app/media-view";
import { ARCHIVE_BUCKET, USER_BUCKET } from "@/lib/media";
import { signedUrl } from "@/lib/media-server";
import { LANGS, BACK_LABEL, SCAN_STRINGS, getLang } from "@/lib/i18n";
import { normalizeShortId } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportContent, unlockCode } from "./actions";

// Scan-Seite: wird beim Antippen des Knopfes oder Scannen des Codes geoeffnet.
// Sie ist ohne Anmeldung erreichbar und gibt nur den hinterlegten Inhalt heraus.

export const metadata: Metadata = {
  title: "Tapu",
  robots: { index: false, follow: false },
};

type Shown =
  | { state: "unavailable" | "config" | "empty" }
  | { state: "unclaimed"; shortId: string }
  | { state: "locked"; shortId: string; blocked: boolean }
  | {
      state: "content";
      shortId: string;
      title: string | null;
      body: string | null;
      mediaPath: string | null;
      rotation?: number;
      mediaUrl: string | null;
      reportable: boolean;
    };

function deviceClass(userAgent: string): "ios" | "android" | "desktop" | "other" {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  if (/windows|macintosh|linux/i.test(userAgent)) return "desktop";
  return "other";
}

async function load(rawId: string, countScan: boolean): Promise<Shown> {
  const shortId = normalizeShortId(rawId);
  if (!shortId) return { state: "unavailable" };

  const admin = createAdminClient();
  if (!admin) return { state: "config" };

  const { data: code } = await admin
    .from("codes")
    .select("id, owner_id, is_active, target_type, message_id, archive_item_id, pin_required, pin_hash, pin_locked_until")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!code || !code.is_active) return { state: "unavailable" };

  // Ein Sprachwechsel lädt die Seite neu und soll nicht als weiterer Scan zählen.
  if (countScan) {
    const userAgent = (await headers()).get("user-agent") ?? "";
    await admin.from("scans").insert({ code_id: code.id, device_class: deviceClass(userAgent) });
  }

  if (!code.owner_id) return { state: "unclaimed", shortId };

  // Geheimer Knopf: ohne gültige Freigabe in diesem Browser gibt es nur die Code-Eingabe.
  if (code.pin_required && code.pin_hash) {
    const token = (await cookies()).get(unlockCookieName(shortId))?.value;
    if (!isUnlocked(shortId, code.pin_hash, token)) {
      const blocked = !!code.pin_locked_until && new Date(code.pin_locked_until).getTime() > Date.now();
      return { state: "locked", shortId, blocked };
    }
  }

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
      .select("body, media_path, media_rotation")
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
        rotation: data.media_rotation ?? 0,
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
  searchParams: Promise<{ gemeldet?: string; sprache?: string; offen?: string; code?: string }>;
}) {
  const { shortId } = await params;
  const { gemeldet, sprache, offen, code: codeError } = await searchParams;
  const shown = await load(shortId, !sprache && !gemeldet && !offen && !codeError);
  const lang = await getLang();
  const t = SCAN_STRINGS[lang];
  const back = encodeURIComponent(`/q/${normalizeShortId(shortId) ?? ""}?sprache=1`);
  const home = <Link className="button secondary" href="/">{t.home}</Link>;

  return (
    <main>
      <div className="scan-head">
        <div className="row">
          <BackButton fallback="/" label={BACK_LABEL[lang]} onlyInternal />
          <Link href="/" className="scan-logo">taPu</Link>
        </div>
        <nav className="scan-langs" aria-label={t.language}>
          {LANGS.map((code) => (
            <a key={code} href={`/lang/${code}?next=${back}`} hrefLang={code} aria-current={code === lang ? "true" : undefined}>
              {code.toUpperCase()}
            </a>
          ))}
        </nav>
      </div>
      {shown.state === "content" && (
        <>
          {shown.title && <h1>{shown.title}</h1>}
          <MediaView path={shown.mediaPath} url={shown.mediaUrl} label={shown.title ?? t.file} rotation={shown.rotation} />
          {shown.body && <p className="message-body">{shown.body}</p>}
          <p className="scan-home">{home}</p>
          {gemeldet && (
            <div className="card notice" role="status">{t.reported}</div>
          )}
          {shown.reportable && !gemeldet && (
            <details style={{ marginTop: "2rem" }}>
              <summary>{t.report}</summary>
              <form className="stack" action={reportContent} style={{ marginTop: "0.75rem" }}>
                <input type="hidden" name="short_id" value={shown.shortId} />
                <label>
                  {t.reportQuestion}
                  <textarea name="reason" maxLength={1000} />
                </label>
                <div><button className="secondary">{t.reportSend}</button></div>
              </form>
            </details>
          )}
        </>
      )}
      {shown.state === "locked" && (
        <>
          <h1>{t.lockedH}</h1>
          <p className="muted">{t.lockedP}</p>
          {shown.blocked ? (
            <div className="card error" role="alert">{t.tooMany}</div>
          ) : (
            <>
              {codeError === "falsch" && <div className="card error" role="alert">{t.wrong}</div>}
              <form className="card stack" action={unlockCode}>
                <input type="hidden" name="short_id" value={shown.shortId} />
                <label>
                  {t.pinLabel}
                  <input
                    className="pin-input"
                    name="pin"
                    inputMode="numeric"
                    pattern="[0-9]{4,8}"
                    maxLength={8}
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </label>
                <div><button>{t.open}</button></div>
              </form>
            </>
          )}
          <p className="scan-home">{home}</p>
        </>
      )}
      {shown.state === "empty" && (
        <>
          <h1>{t.emptyH}</h1>
          <p className="muted">{t.emptyP}</p>
          <p className="scan-home">{home}</p>
        </>
      )}
      {shown.state === "unclaimed" && (
        <>
          <h1>{t.unclaimedH}</h1>
          <p className="muted">{t.unclaimedP}</p>
          <div className="row">
            <Link className="button" href={`/portal?claim=${shown.shortId}`}>{t.claim}</Link>
            {home}
          </div>
        </>
      )}
      {shown.state === "unavailable" && (
        <>
          <h1>{t.missingH}</h1>
          <p className="muted">{t.missingP}</p>
          <p className="scan-home">{home}</p>
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
