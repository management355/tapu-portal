import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrigin, normalizeShortId } from "@/lib/site";
import { getAccount } from "@/lib/account";
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
};

type ArchiveRow = { id: string; title: string; category: string | null; is_premium: boolean };
type MessageRow = { id: string; kind: string; body: string | null };
type PlanRow = { id: string; name: string; code_limit: number; uploads_allowed: boolean };

const ERRORS: Record<string, string> = {
  invalid_id: "Diese Nummer hat nicht das richtige Format. Sie besteht aus 10 Zeichen.",
  code_limit_reached: "Dein Limit an Knöpfen ist erreicht. Mit einem Abo sind mehr möglich.",
  code_not_claimable: "Dieser Knopf ist schon vergeben oder nicht aktiv.",
  not_authenticated: "Bitte melde dich zuerst an.",
  claim: "Der Knopf konnte nicht übernommen werden.",
  create: "Der QR-Code konnte nicht erstellt werden. Vielleicht ist dein Limit erreicht.",
  update: "Die Änderung konnte nicht gespeichert werden.",
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
      .select("id, short_id, chip_uid, title, target_type, message_id, archive_item_id, is_active")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("archive_items")
      .select("id, title, category, is_premium")
      .eq("is_published", true)
      .order("title", { ascending: true }),
    supabase
      .from("messages")
      .select("id, kind, body")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    getOrigin(),
  ]);

  const plan = (subscription.data?.plans ?? null) as unknown as PlanRow | null;
  const codeRows = (codes.data ?? []) as CodeRow[];
  const archiveRows = (archive.data ?? []) as ArchiveRow[];
  const messageRows = (messages.data ?? []) as MessageRow[];
  const limit = plan?.code_limit ?? 0;

  return (
    <main>
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
        return (
          <form key={code.id} className="card stack" action={updateCode}>
            <input type="hidden" name="id" value={code.id} />
            <div className="row between">
              <div>
                <code className="id">{code.short_id}</code>{" "}
                <span className="badge">{code.chip_uid ? "Knopf" : "QR-Code ohne Knopf"}</span>{" "}
                {!code.is_active && <span className="badge">pausiert</span>}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qr" src={`/portal/qr/${code.short_id}`} alt={`QR-Code für ${link}`} />
            </div>
            <p className="small">
              <Link href={`/q/${code.short_id}`}>{link}</Link>
            </p>
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
                        {(message.body ?? ({ image: "Bild", audio: "Audio", video: "Video" } as Record<string, string>)[message.kind] ?? "Botschaft").slice(0, 60)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
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
