"use server";

import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/account";
import { isUserPath, kindFromPath, USER_BUCKET } from "@/lib/media";
import { objectExists, removeObject } from "@/lib/media-server";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true } | { ok: false; error: string };

const KIND_NAMES: Record<string, string> = { text: "Text", image: "Bild", audio: "Audio", video: "Video" };

// Bezeichnung, wenn der Nutzer keine eingibt: Art der Botschaft und Zeitpunkt.
function autoTitle(kind: string): string {
  const when = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return `${KIND_NAMES[kind] ?? "Botschaft"} vom ${when}`;
}

export async function createMessage(input: { title?: string; body: string; path: string | null; rotation?: number }): Promise<SaveResult> {
  const account = await getAccount();
  if (!account) return { ok: false, error: "Bitte melde dich an." };
  if (!account.plan?.uploads_allowed) {
    return { ok: false, error: "Eigene Botschaften sind in deiner Stufe nicht enthalten." };
  }

  const title = typeof input?.title === "string" ? input.title.trim() : "";
  if (title.length > 80) return { ok: false, error: "Die Bezeichnung ist zu lang. Erlaubt sind 80 Zeichen." };
  const body = typeof input?.body === "string" ? input.body.trim() : "";
  const path = typeof input?.path === "string" && input.path !== "" ? input.path : null;
  if (body.length > 2000) return { ok: false, error: "Der Text ist zu lang. Erlaubt sind 2.000 Zeichen." };
  if (!body && !path) return { ok: false, error: "Bitte schreib einen Text oder wähle eine Datei." };

  if (path) {
    if (!isUserPath(path, account.userId) || !(await objectExists(USER_BUCKET, path))) {
      return { ok: false, error: "Die Datei wurde nicht gefunden. Bitte lade sie noch einmal hoch." };
    }
  }

  const supabase = await createClient();
  const kind = path ? (kindFromPath(path) ?? "text") : "text";
  const { error } = await supabase.from("messages").insert({
    title: title || autoTitle(kind),
    kind,
    media_rotation: kind === "video" && [90, 180, 270].includes(Number(input?.rotation)) ? Number(input.rotation) : 0,
    body: body || null,
    media_path: path,
  });
  if (error) {
    if (path) await removeObject(USER_BUCKET, path);
    return { ok: false, error: "Die Botschaft konnte nicht gespeichert werden." };
  }
  revalidatePath("/portal/messages");
  revalidatePath("/portal");
  return { ok: true };
}

export async function deleteMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const account = await getAccount();
  if (!account) return;
  const supabase = await createClient();
  // Die Zugriffsregeln lassen nur eigene Botschaften durch.
  const { data } = await supabase.from("messages").select("media_path").eq("id", id).maybeSingle();
  if (!data) return;
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (!error && data.media_path && isUserPath(data.media_path, account.userId)) {
    await removeObject(USER_BUCKET, data.media_path);
  }
  revalidatePath("/portal/messages");
  revalidatePath("/portal");
}

// Bezeichnung ändern. Bleibt das Feld leer, vergeben wir wieder eine automatische.
export async function renameMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const account = await getAccount();
  if (!account) return;
  const supabase = await createClient();
  // Die Zugriffsregeln lassen nur eigene Botschaften durch.
  const { data } = await supabase.from("messages").select("kind").eq("id", id).maybeSingle();
  if (!data) return;
  await supabase.from("messages").update({ title: title || autoTitle(data.kind) }).eq("id", id);
  revalidatePath("/portal/messages");
  revalidatePath("/portal");
}
