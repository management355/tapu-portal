"use server";

import { getAccount } from "@/lib/account";
import { ARCHIVE_BUCKET, MAX_FILE_BYTES, MIME_TO_EXT, USER_BUCKET } from "@/lib/media";
import { createAdminClient } from "@/lib/supabase/admin";

export type PrepareResult =
  | { ok: true; bucket: string; path: string; token: string }
  | { ok: false; error: string };

// Stellt einen einmaligen Upload-Link aus, nachdem Rechte, Dateityp, Groesse
// und Speicherlimit geprueft sind. Die Datei geht danach direkt vom Browser
// in den Speicher.
export async function prepareUpload(
  scope: "user" | "archive",
  file: { type: string; size: number },
): Promise<PrepareResult> {
  if (scope !== "user" && scope !== "archive") return { ok: false, error: "Ungültige Anfrage." };
  const type = typeof file?.type === "string" ? file.type : "";
  const size = typeof file?.size === "number" && Number.isFinite(file.size) ? file.size : -1;

  const account = await getAccount();
  if (!account) return { ok: false, error: "Bitte melde dich an." };

  const ext = MIME_TO_EXT[type];
  if (!ext) return { ok: false, error: "Dieser Dateityp wird nicht unterstützt." };
  if (size <= 0 || size > MAX_FILE_BYTES) {
    return { ok: false, error: "Die Datei ist zu groß. Erlaubt sind höchstens 50 MB." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Der Dateispeicher ist noch nicht eingerichtet." };

  let bucket: string;
  let path: string;
  if (scope === "archive") {
    if (!account.isAdmin) return { ok: false, error: "Keine Berechtigung." };
    bucket = ARCHIVE_BUCKET;
    path = `archive/${crypto.randomUUID()}.${ext}`;
  } else {
    if (!account.plan?.uploads_allowed) {
      return { ok: false, error: "Eigene Uploads sind in deiner Stufe nicht enthalten." };
    }
    const { data: used, error } = await admin.rpc("user_storage_bytes", { p_user: account.userId });
    if (error) return { ok: false, error: "Der Speicher konnte nicht geprüft werden." };
    const limit = account.plan.storage_limit_mb * 1024 * 1024;
    if (Number(used ?? 0) + size > limit) {
      return { ok: false, error: "Dein Speicher reicht für diese Datei nicht mehr aus." };
    }
    bucket = USER_BUCKET;
    path = `${account.userId}/${crypto.randomUUID()}.${ext}`;
  }

  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Der Upload konnte nicht vorbereitet werden." };
  return { ok: true, bucket, path, token: data.token };
}
