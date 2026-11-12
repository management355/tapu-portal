"use server";

import { redirect } from "next/navigation";
import { getAccount } from "@/lib/account";
import { USER_BUCKET } from "@/lib/media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Loescht das eigene Konto mit Profil, Botschaften und Dateien. Knoepfe aus
// der Fabrik werden wieder frei, selbst erstellte QR-Codes werden entfernt.
export async function deleteAccount(formData: FormData) {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (formData.get("confirm") !== "on") redirect("/portal/konto?error=confirm");

  const admin = createAdminClient();
  if (!admin) redirect("/portal/konto?error=config");

  const userId = account.userId;

  // Dateien im eigenen Ordner entfernen.
  const { data: files } = await admin.storage.from(USER_BUCKET).list(userId, { limit: 1000 });
  const paths = (files ?? []).map((file) => `${userId}/${file.name}`);
  if (paths.length > 0) await admin.storage.from(USER_BUCKET).remove(paths);

  await admin.from("codes").delete().eq("owner_id", userId).is("chip_uid", null);
  await admin
    .from("codes")
    .update({
      owner_id: null,
      title: null,
      target_type: null,
      message_id: null,
      archive_item_id: null,
      pin_hash: null,
      claimed_at: null,
    })
    .eq("owner_id", userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) redirect("/portal/konto?error=delete");

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?konto=geloescht");
}
