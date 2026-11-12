import { redirect } from "next/navigation";
import { MediaView } from "@/app/media-view";
import { getAccount } from "@/lib/account";
import { USER_BUCKET } from "@/lib/media";
import { signedUrl } from "@/lib/media-server";
import { createClient } from "@/lib/supabase/server";
import { PortalNav } from "../nav";
import { deleteMessage } from "./actions";
import { MessageForm } from "./message-form";

type MessageRow = {
  id: string;
  body: string | null;
  media_path: string | null;
  status: "published" | "blocked";
};

export default async function MessagesPage() {
  const account = await getAccount();
  if (!account) redirect(`/login?next=${encodeURIComponent("/portal/messages")}`);

  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, body, media_path, status")
    .eq("owner_id", account.userId)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as MessageRow[];
  const urls = await Promise.all(rows.map((row) => signedUrl(USER_BUCKET, row.media_path)));

  return (
    <main>
      <h1>Meine Botschaften</h1>
      <PortalNav current="/portal/messages" isAdmin={account.isAdmin} />

      {account.plan?.uploads_allowed ? (
        <>
          <h2>Neue Botschaft</h2>
          <MessageForm />
        </>
      ) : (
        <div className="card">
          Eigene Botschaften mit Text, Bild, Audio oder Video gehören zu den Stufen Plus und Pro. In
          deiner Stufe wählst du aus dem Archiv.
        </div>
      )}

      <h2>Gespeichert</h2>
      {rows.length === 0 && <p className="muted">Noch keine eigenen Botschaften.</p>}
      {rows.map((row, index) => (
        <div key={row.id} className="card stack">
          {row.status === "blocked" && (
            <div><span className="badge">gesperrt</span></div>
          )}
          <MediaView path={row.media_path} url={urls[index]} label="Deine Datei" />
          {row.body && <p className="message-body" style={{ fontSize: "1rem" }}>{row.body}</p>}
          <form action={deleteMessage}>
            <input type="hidden" name="id" value={row.id} />
            <button className="secondary">Löschen</button>
          </form>
        </div>
      ))}
    </main>
  );
}
