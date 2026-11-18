"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUnlockToken, isEnterablePin, unlockCookieName, verifyPin } from "@/lib/pin";
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

// Code-Eingabe eines geheimen Knopfes. Nach fünf falschen Versuchen ist der Knopf gesperrt,
// zuerst 10 Minuten, bei weiteren Fehlversuchen länger (bis 60 Minuten). So kann niemand
// alle Codes durchprobieren.
export async function unlockCode(formData: FormData) {
  const shortId = normalizeShortId(String(formData.get("short_id") ?? ""));
  if (!shortId) redirect("/");
  const pin = String(formData.get("pin") ?? "").trim();

  const admin = createAdminClient();
  if (!admin) redirect(`/q/${shortId}`);
  const { data: code } = await admin
    .from("codes")
    .select("id, pin_required, pin_hash")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!code || !code.pin_required || !code.pin_hash) redirect(`/q/${shortId}`);

  // Der Versuch wird in der Datenbank gezählt, bevor der Code geprüft wird. Zählen und Sperren
  // geschehen dort in einem Schritt, damit auch viele gleichzeitige Anfragen die Sperre nicht umgehen.
  const { data: attempt, error } = await admin.rpc("pin_attempt", { p_code_id: code.id });
  if (error || (attempt !== "ok" && attempt !== "last")) redirect(`/q/${shortId}?code=gesperrt`);

  if (!isEnterablePin(pin) || !verifyPin(pin, code.pin_hash)) {
    redirect(`/q/${shortId}?code=${attempt === "last" ? "gesperrt" : "falsch"}`);
  }

  await admin
    .from("codes")
    .update({ pin_fail_count: 0, pin_locked_until: null, pin_lock_level: 0 })
    .eq("id", code.id);
  const token = createUnlockToken(shortId, code.pin_hash);
  if (token) {
    (await cookies()).set(unlockCookieName(shortId), token.value, {
      path: `/q/${shortId}`,
      maxAge: token.maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }
  redirect(`/q/${shortId}?offen=1`);
}
