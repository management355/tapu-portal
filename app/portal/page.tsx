import Link from "next/link";
import { SiteHead } from "@/app/site-head";
import { redirect } from "next/navigation";
import { getOrigin, normalizeShortId } from "@/lib/site";
import { getAccount } from "@/lib/account";
import { MediaView } from "@/app/media-view";
import { ARCHIVE_BUCKET, USER_BUCKET } from "@/lib/media";
import { signedUrl } from "@/lib/media-server";
import { isConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { claimCode, createCode, updateCode } from "./actions";
import { PortalNav } from "./nav";

type CodeRow = {
  id: string;
  short_id: string;
  chip_uid: string | null;
  title: string | null;
  target_type: "message" | "archive" | null;
  message_id: string | null;
  archive_item_id: string | null;
  is_active: boolean;
  pin_required: boolean;
  has_pin: boolean;
};

type ArchiveRow = {
  id: string;
  title: string;
  category: string | null;
  is_premium: boolean;
  body: string | null;
  media_path: string | null;
};
type MessageRow = { id: string; kind: string; body: string | null; media_path: string | null; status: string };
type Preview = { title: string | null; body: string | null; path: string | null; url: string | null; blocked: boolean };
type PlanRow = { id: string; name: string; code_limit: number; uploads_allowed: boolean };

const KIND_LABELS: Record<string, string> = { text: "Text", image: "Bild", audio: "Audio", video: "Video" };

// Zeigt in der Auswahl, ob eine Botschaft ein Medium enthaelt.
function messageLabel(message: MessageRow): string {
  const kind = KIND_LABELS[message.kind] ?? "Botschaft";
  const text = (message.body ?? "").slice(0, 50);
  if (message.kind === "text") return text || kind;
  return text ? `${kind} mit Text: ${text}` : `${kind} ohne Text`;
}

const ERRORS: Record<string, string> = {
  invalid_id: "Diese Nummer hat nicht das richtige Format. Sie besteht aus 10 Zeichen.",
  code_limit_reached: "Dein Limit an Knöpfen ist erreicht. Mit einem Abo sind mehr möglich.",
  code_not_claimable: "Dieser Knopf ist schon vergeben oder nicht aktiv.",
  not_authenticated: "Bitte melde dich zuerst an.",
  claim: "Der Knopf konnte nicht übernommen werden.",
  create: "Der QR-Code konnte nicht erstellt werden. Vielleicht ist dein Limit erreicht.",
  update: "Die Änderung konnte nicht gespeichert werden.",
  pin_format: "Der Zahlencode muss aus 4 bis 8 Ziffern bestehen.",
  pin_missing: "Für einen geheimen Knopf brauchst du einen Zahlencode. Bitte trage einen ein.",
};

const NOTICES: Record<string, string> = {
  claimed: "Der Knopf gehört jetzt dir.",
  created: "Der QR-Code ist erstellt.",
  saved: "Gespeichert.",
};

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; claim?: string }>;
}) {
  const { error, notice, claim } = await searchParams;
  const claimId = claim ? normalizeShortId(claim) : null;

  if (!isConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const next = claimId ? `/portal?claim=${claimId}` : "/portal";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const [account, subscription, codes, archive, messages, origin] = await Promise.all([
    getAccount(),
    supabase
      .from("subscriptions")
      .select("status, plans(id, name, code_limit, uploads_allowed)")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("codes")
      .select("id, short_id, chip_uid, title, target_type, message_id, archive_item_id, is_active, pin_required, has_pin")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("archive_items")
      .select("id, title, category, is_premium, body, media_path")
      .eq("is_published", true)
      .order("title", { ascending: true }),
    supabase
      .from("messages")
      .select("id, kind, body, media_path, status")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    getOrigin(),
  ]);

  const plan = (subscription.data?.plans ?? null) as unknown as PlanRow | null;
  const codeRows = (codes.data ?? []) as CodeRow[];
  const archiveRows = (archive.data ?? []) as ArchiveRow[];
  const messageRows = (messages.data ?? []) as MessageRow[];
  const limit = plan?.code_limit ?? 0;

  // Vorschau der hinterlegten Botschaft je Knopf (Dateien über kurzlebige Links).
  const previews = new Map<string, Preview>();
  await Promise.all(
    codeRows.map(async (code) => {
      if (code.target_type === "message" && code.message_id) {
        const message = messageRows.find((row) => row.id === code.message_id);
        if (!message) return;
        previews.set(code.id, {
          title: null,
          body: message.body,
          path: message.media_path,
          url: await signedUrl(USER_BUCKET, message.media_path),
          blocked: message.status === "blocked",
        });
      } else if (code.target_type === "archive" && code.archive_item_id) {
        const item = archiveRows.find((row) => row.id === code.archive_item_id);
        if (!item) return;
        previews.set(code.id, {
          title: item.title,
          body: item.body,
          path: item.media_path,
          url: await signedUrl(ARCHIVE_BUCKET, item.media_path),
          blocked: false,
        });
      }
    }),
  );

  return (
    <main>
      <SiteHead />
      <div className="row between">
        <h1>Meine Knöpfe</h1>
        <form action="/auth/signout" method="post">
          <button className="secondary">Abmelden</button>
        </form>
      </div>
      <PortalNav current="/portal" isAdmin={account?.isAdmin ?? false} />
      <p className="muted small">
        {user.email} · Stufe {plan?.name ?? "unbekannt"} · {codeRows.length} von {limit} Knöpfen belegt
      </p>

      {error && ERRORS[error] && <div className="card error" role="alert">{ERRORS[error]}</div>}
      {notice && NOTICES[notice] && <div className="card notice" role="status">{NOTICES[notice]}</div>}

      <h2>Knopf übernehmen</h2>
      <p className="muted small">
        Du hast eine Puppe mit Knopf? Tippe den Knopf mit dem Handy an, dann wird die Nummer hier
        automatisch eingetragen.
      </p>
      <form className="card stack" action={claimCode}>
        <label>
          Nummer deines Knopfes
          <input name="short_id" defaultValue={claimId ?? ""} autoCapitalize="none" autoCorrect="off" placeholder="z. B. a9gsbne6h9" required />
        </label>
        <p className="muted small">
          Von Hand eintragen musst du sie nur, wenn das Antippen nicht klappt. Du findest die 10 Zeichen
          am Ende der Adresse, die der Knopf öffnet, nach /q/.
        </p>
        <div><button>Übernehmen</button></div>
      </form>

      <h2>QR-Code ohne Knopf erstellen</h2>
      <p className="muted small">
        Für Karten, Sticker oder Geschenke ohne Puppe: Du bekommst einen QR-Code zum Ausdrucken, hinter
        dem du eine Botschaft hinterlegst.
      </p>
      <form className="card stack" action={createCode}>
        <label>
          Name (nur für dich sichtbar)
          <input name="title" maxLength={120} placeholder="z. B. Karte für Oma" />
        </label>
        <div><button className="secondary">QR-Code erstellen</button></div>
      </form>

      <h2>Übersicht</h2>
      {codeRows.length === 0 && (
        <p className="muted">Noch nichts hier. Übernimm einen Knopf oder erstelle einen QR-Code.</p>
      )}
      {codeRows.map((code) => {
        const link = `${origin}/q/${code.short_id}`;
        const current =
          code.target_type === "archive" && code.archive_item_id
            ? `archive:${code.archive_item_id}`
            : code.target_type === "message" && code.message_id
              ? `message:${code.message_id}`
              : "";
        const preview = previews.get(code.id);
        return (
          <form key={code.id} className="card stack" action={updateCode}>
            <input type="hidden" name="id" value={code.id} />
            <div className="knopf-row">
              <div className="knopf-side">
                <div className={`knopf${code.pin_required ? " knopf-secret" : ""}${code.is_active ? "" : " knopf-off"}`}>
                  <span className="knopf-logo">{code.pin_required ? "xtaPu" : "taPu"}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/portal/qr/${code.short_id}`} alt={`QR-Code für ${link}`} />
                  <span className="knopf-code">
                    {code.short_id.slice(0, 5).toUpperCase()}·{code.short_id.slice(5).toUpperCase()}
                  </span>
                </div>
                <div className="knopf-meta">
                  <span className="badge">{code.chip_uid ? "Knopf" : "QR-Code ohne Knopf"}</span>{" "}
                  {code.pin_required && <span className="badge">geheim</span>}{" "}
                  {!code.is_active && <span className="badge">pausiert</span>}
                </div>
                <div className="row" style={{ justifyContent: "center" }}>
                  <Link className="button secondary small" href={`/q/${code.short_id}`}>Ansehen</Link>
                  <Link className="button secondary small" href={`/portal/druck/${code.short_id}`}>Drucken</Link>
                </div>
              </div>
              <div className="knopf-message">
                {preview ? (
                  <>
                    {code.title && <div className="knopf-title">{code.title}</div>}
                    {preview.blocked && <div className="card error">Diese Botschaft ist gesperrt und wird nicht angezeigt.</div>}
                    {preview.title && <div className="knopf-archive">{preview.title}</div>}
                    <MediaView path={preview.path} url={preview.url} label={preview.title ?? "Hinterlegte Datei"} />
                    {preview.body && <p className="message-body">{preview.body}</p>}
                  </>
                ) : (
                  <div className="knopf-empty">
                    {code.title && <div className="knopf-title">{code.title}</div>}
                    <div className="knopf-void">Gähnende Leere</div>
                    <p className="muted small">Wähle unten eine Botschaft aus.</p>
                  </div>
                )}
              </div>
            </div>
            <label>
              Name
              <input name="title" defaultValue={code.title ?? ""} maxLength={120} />
            </label>
            <label>
              Botschaft, die beim Antippen oder Scannen erscheint
              <select name="target" defaultValue={current}>
                <option value="">Noch keine Botschaft</option>
                {archiveRows.length > 0 && (
                  <optgroup label="Aus dem Archiv">
                    {archiveRows.map((item) => (
                      <option key={item.id} value={`archive:${item.id}`}>
                        {item.category ? `${item.category}: ` : ""}{item.title}{item.is_premium ? " (Premium)" : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {messageRows.length > 0 && (
                  <optgroup label="Meine Botschaften">
                    {messageRows.map((message) => (
                      <option key={message.id} value={`message:${message.id}`}>
                        {messageLabel(message)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <fieldset className="pin-box">
              <legend>Wer darf die Botschaft sehen?</legend>
              <label className="check">
                <input type="checkbox" name="pin_required" defaultChecked={code.pin_required} />
                Nur mit Zahlencode öffnen (geheimer Knopf, xtaPu)
              </label>
              <label>
                {code.has_pin ? "Zahlencode ändern (leer lassen, um den bisherigen zu behalten)" : "Zahlencode festlegen"}
                <input
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  maxLength={8}
                  autoComplete="off"
                  placeholder="4 bis 8 Ziffern"
                />
              </label>
              <p className="muted small" style={{ margin: 0 }}>
                {code.has_pin
                  ? "Für diesen Knopf ist ein Zahlencode hinterlegt. Ohne Haken sieht jeder die Botschaft sofort."
                  : "Für diesen Knopf ist noch kein Zahlencode hinterlegt. Ohne Haken sieht jeder die Botschaft sofort."}
              </p>
            </fieldset>
            <label className="row" style={{ display: "flex" }}>
              <input type="checkbox" name="is_active" defaultChecked={code.is_active} style={{ width: "auto" }} />
              Aktiv
            </label>
            <div><button>Speichern</button></div>
          </form>
        );
      })}
    </main>
  );
}
