"use server";

import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/account";
import { ARCHIVE_BUCKET, isArchivePath } from "@/lib/media";
import { objectExists, removeObject } from "@/lib/media-server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SaveResult = { ok: true } | { ok: false; error: string };

// Jede Aktion prueft selbst, ob der Aufrufer Admin ist. Erst danach wird der
// Client mit dem geheimen Schluessel verwendet.
async function adminClient() {
  const account = await getAccount();
  if (!account?.isAdmin) return null;
  return createAdminClient();
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createArchiveItem(input: {
  title: string;
  category: string;
  body: string;
  path: string | null;
  isPremium: boolean;
  isPublished: boolean;
}): Promise<SaveResult> {
  const admin = await adminClient();
  if (!admin) return { ok: false, error: "Keine Berechtigung." };

  const title = clean(input?.title, 120);
  const category = clean(input?.category, 60);
  const body = clean(input?.body, 2000);
  const path = typeof input?.path === "string" && input.path !== "" ? input.path : null;
  if (!title) return { ok: false, error: "Bitte gib einen Titel ein." };
  if (!body && !path) return { ok: false, error: "Bitte schreib einen Text oder wähle eine Datei." };
  if (path && (!isArchivePath(path) || !(await objectExists(ARCHIVE_BUCKET, path)))) {
    return { ok: false, error: "Die Datei wurde nicht gefunden. Bitte lade sie noch einmal hoch." };
  }

  const { error } = await admin.from("archive_items").insert({
    title,
    category: category || null,
    kind: path ? "media" : "message",
    body: body || null,
    media_path: path,
    is_premium: input?.isPremium === true,
    is_published: input?.isPublished === true,
  });
  if (error) {
    if (path) await removeObject(ARCHIVE_BUCKET, path);
    return { ok: false, error: "Der Eintrag konnte nicht gespeichert werden." };
  }
  revalidatePath("/admin");
  revalidatePath("/portal");
  return { ok: true };
}

export async function updateArchiveItem(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const title = clean(formData.get("title"), 120);
  if (!title) return;
  await admin
    .from("archive_items")
    .update({
      title,
      category: clean(formData.get("category"), 60) || null,
      body: clean(formData.get("body"), 2000) || null,
      is_premium: formData.get("is_premium") === "on",
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function deleteArchiveItem(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const { data } = await admin.from("archive_items").select("media_path").eq("id", id).maybeSingle();
  if (!data) return;
  const { error } = await admin.from("archive_items").delete().eq("id", id);
  if (!error && data.media_path && isArchivePath(data.media_path)) {
    await removeObject(ARCHIVE_BUCKET, data.media_path);
  }
  revalidatePath("/admin");
  revalidatePath("/portal");
}

// Gemeldete Botschaft sperren: Sie erscheint dann auf keiner Scan-Seite mehr.
export async function blockReportedMessage(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const messageId = String(formData.get("message_id") ?? "");
  await admin.from("messages").update({ status: "blocked" }).eq("id", messageId);
  await admin.from("reports").update({ status: "resolved" }).eq("message_id", messageId).eq("status", "open");
  revalidatePath("/admin");
}

export async function unblockMessage(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const messageId = String(formData.get("message_id") ?? "");
  await admin.from("messages").update({ status: "published" }).eq("id", messageId);
  revalidatePath("/admin");
}

export async function dismissReport(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await admin.from("reports").update({ status: "dismissed" }).eq("id", id);
  revalidatePath("/admin");
}
