"use server";

import { redirect } from "next/navigation";
import { normalizeShortId } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

// Meldeknopf auf der Scan-Seite: legt eine Meldung fuer den Admin an.
export async function reportContent(formData: FormData) {
  const shortId = normalizeShortId(String(formData.get("short_id") ?? ""));
  if (!shortId) redirect("/");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);

  const admin = createAdminClient();
  if (admin) {
    const { data: code } = await admin
      .from("codes")
      .select("id, message_id, target_type")
      .eq("short_id", shortId)
      .maybeSingle();
    if (code && code.target_type === "message" && code.message_id) {
      await admin.from("reports").insert({
        code_id: code.id,
        message_id: code.message_id,
        reason: reason || null,
      });
    }
  }
  redirect(`/q/${shortId}?gemeldet=1`);
}
