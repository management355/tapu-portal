import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Kurzlebiger Link (1 Stunde) auf eine Datei im privaten Speicher.
export async function signedUrl(bucket: string, path: string | null): Promise<string | null> {
  if (!path) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function objectExists(bucket: string, path: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const slash = path.lastIndexOf("/");
  const folder = path.slice(0, slash);
  const name = path.slice(slash + 1);
  const { data } = await admin.storage.from(bucket).list(folder, { search: name, limit: 5 });
  return (data ?? []).some((entry) => entry.name === name);
}

export async function removeObject(bucket: string, path: string | null): Promise<void> {
  if (!path) return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin.storage.from(bucket).remove([path]);
}
