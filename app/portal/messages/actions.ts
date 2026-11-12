"use server";

import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/account";
import { isUserPath, kindFromPath, USER_BUCKET } from "@/lib/media";
import { objectExists, removeObject } from "@/lib/media-server";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function createMessage(input: { body: string; path: string | null }): Promise<SaveResult> {
  const account = await getAccount();
  if (!account) return { ok: false, error: "Bitte melde dich an." };
  if (!account.plan?.uploads_allowed) {
    return { ok: false, error: "Eigene Botschaften sind in deiner Stufe nicht enthalten." };
  }

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
  const { error } = await supabase.from("messages").insert({
    kind: path ? (kindFromPath(path) ?? "text") : "text",
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
