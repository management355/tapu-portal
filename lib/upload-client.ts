"use client";

import { prepareUpload } from "@/app/upload-actions";
import { createClient } from "@/lib/supabase/browser";

// Laedt eine Datei hoch und liefert ihren Pfad im Speicher.
export async function uploadFile(
  scope: "user" | "archive",
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const prepared = await prepareUpload(scope, { type: file.type, size: file.size });
  if (!prepared.ok) return prepared;
  const { error } = await createClient()
    .storage.from(prepared.bucket)
    .uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type });
  if (error) return { ok: false, error: "Das Hochladen ist fehlgeschlagen. Bitte versuche es noch einmal." };
  return { ok: true, path: prepared.path };
}
