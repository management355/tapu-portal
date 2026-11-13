import { notFound, redirect } from "next/navigation";
import { SiteHead } from "@/app/site-head";
import { MediaView } from "@/app/media-view";
import { PortalNav } from "@/app/portal/nav";
import { getAccount } from "@/lib/account";
import { ARCHIVE_BUCKET, USER_BUCKET } from "@/lib/media";
import { signedUrl } from "@/lib/media-server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  blockReportedMessage,
  deleteArchiveItem,
  dismissReport,
  unblockMessage,
  updateArchiveItem,
} from "./actions";
import { ArchiveForm } from "./archive-form";

type ArchiveRow = {
  id: string;
  title: string;
  category: string | null;
  body: string | null;
  media_path: string | null;
  is_premium: boolean;
  is_published: boolean;
};

type ReportRow = {
  id: number;
  reason: string | null;
  created_at: string;
  message_id: string | null;
  messages: { body: string | null; media_path: string | null; status: string } | null;
};

type BlockedRow = { id: string; body: string | null };

export default async function AdminPage() {
  const account = await getAccount();
  if (!account) redirect(`/login?next=${encodeURIComponent("/admin")}`);
  if (!account.isAdmin) notFound();

  const admin = createAdminClient();
  if (!admin) {
    return (
      <main>
        <SiteHead />
        <h1>Admin</h1>
        <div className="card error">Es fehlt die Angabe SUPABASE_SECRET_KEY.</div>
      </main>
    );
  }

  const [archive, reports, blocked, stats] = await Promise.all([
    admin
      .from("archive_items")
      .select("id, title, category, body, media_path, is_premium, is_published")
      .order("created_at", { ascending: false }),
    admin
      .from("reports")
      .select("id, reason, created_at, message_id, messages(body, media_path, status)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(50),
    admin.from("messages").select("id, body").eq("status", "blocked").limit(50),
    Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("codes").select("id", { count: "exact", head: true }),
      admin.from("scans").select("id", { count: "exact", head: true }),
    ]),
  ]);

  const archiveRows = (archive.data ?? []) as ArchiveRow[];
  const reportRows = (reports.data ?? []) as unknown as ReportRow[];
  const blockedRows = (blocked.data ?? []) as BlockedRow[];
  const archiveUrls = await Promise.all(archiveRows.map((row) => signedUrl(ARCHIVE_BUCKET, row.media_path)));
  const reportUrls = await Promise.all(
    reportRows.map((row) => signedUrl(USER_BUCKET, row.messages?.media_path ?? null)),
  );
  const [users, codes, scans] = stats;

  return (
    <main>
      <SiteHead />
      <h1>Admin</h1>
      <PortalNav current="/admin" isAdmin />
      <p className="muted small">
        {users.count ?? 0} Konten · {codes.count ?? 0} Knöpfe und Codes · {scans.count ?? 0} Aufrufe
      </p>

      <h2>Meldungen</h2>
      {reportRows.length === 0 && <p className="muted">Keine offenen Meldungen.</p>}
      {reportRows.map((report, index) => (
        <div key={report.id} className="card stack">
          <p className="small muted">
            Gemeldet am {new Date(report.created_at).toLocaleDateString("de-DE")}
            {report.reason ? `: ${report.reason}` : ""}
          </p>
          {report.messages ? (
            <>
              <MediaView path={report.messages.media_path} url={reportUrls[index]} label="Gemeldete Datei" />
              {report.messages.body && <p>{report.messages.body}</p>}
            </>
          ) : (
            <p className="muted">Die Botschaft gibt es nicht mehr.</p>
          )}
          <div className="row">
            {report.message_id && report.messages && (
              <form action={blockReportedMessage}>
                <input type="hidden" name="message_id" value={report.message_id} />
                <button>Botschaft sperren</button>
              </form>
            )}
            <form action={dismissReport}>
              <input type="hidden" name="id" value={report.id} />
              <button className="secondary">Meldung verwerfen</button>
            </form>
          </div>
        </div>
      ))}

      {blockedRows.length > 0 && (
        <>
          <h2>Gesperrte Botschaften</h2>
          {blockedRows.map((row) => (
            <div key={row.id} className="card row between">
              <span>{(row.body ?? "Datei ohne Text").slice(0, 80)}</span>
              <form action={unblockMessage}>
                <input type="hidden" name="message_id" value={row.id} />
                <button className="secondary">Wieder freigeben</button>
              </form>
            </div>
          ))}
        </>
      )}

      <h2>Neuer Archiv-Eintrag</h2>
      <ArchiveForm />

      <h2>Archiv ({archiveRows.length})</h2>
      {archiveRows.map((item, index) => (
        <div key={item.id} className="card stack">
          <MediaView path={item.media_path} url={archiveUrls[index]} label={item.title} />
          <form className="stack" action={updateArchiveItem}>
            <input type="hidden" name="id" value={item.id} />
            <label>
              Titel
              <input name="title" defaultValue={item.title} maxLength={120} required />
            </label>
            <label>
              Kategorie
              <input name="category" defaultValue={item.category ?? ""} maxLength={60} />
            </label>
            <label>
              Text
              <textarea name="body" defaultValue={item.body ?? ""} maxLength={2000} />
            </label>
            <label className="check">
              <input type="checkbox" name="is_published" defaultChecked={item.is_published} />
              Veröffentlicht
            </label>
            <label className="check">
              <input type="checkbox" name="is_premium" defaultChecked={item.is_premium} />
              Nur für Abonnenten (Premium)
            </label>
            <div><button>Speichern</button></div>
          </form>
          <form action={deleteArchiveItem}>
            <input type="hidden" name="id" value={item.id} />
            <button className="secondary">Eintrag löschen</button>
          </form>
        </div>
      ))}
    </main>
  );
}
