"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MAX_PIN_ATTEMPTS,
  PIN_LOCK_MINUTES,
  createUnlockToken,
  isValidPin,
  unlockCookieName,
  verifyPin,
} from "@/lib/pin";
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

// Code-Eingabe eines geheimen Knopfes. Nach mehreren falschen Versuchen ist der Knopf
// für einige Minuten gesperrt, damit niemand alle Codes durchprobieren kann.
export async function unlockCode(formData: FormData) {
  const shortId = normalizeShortId(String(formData.get("short_id") ?? ""));
  if (!shortId) redirect("/");
  const pin = String(formData.get("pin") ?? "").trim();

  const admin = createAdminClient();
  if (!admin) redirect(`/q/${shortId}`);
  const { data: code } = await admin
    .from("codes")
    .select("id, pin_required, pin_hash, pin_fail_count, pin_locked_until")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!code || !code.pin_required || !code.pin_hash) redirect(`/q/${shortId}`);

  const lockedUntil = code.pin_locked_until ? new Date(code.pin_locked_until).getTime() : 0;
  if (lockedUntil > Date.now()) redirect(`/q/${shortId}?code=gesperrt`);

  if (!isValidPin(pin) || !verifyPin(pin, code.pin_hash)) {
    const fails = (code.pin_fail_count ?? 0) + 1;
    const lock = fails >= MAX_PIN_ATTEMPTS;
    await admin
      .from("codes")
      .update({
        pin_fail_count: lock ? 0 : fails,
        pin_locked_until: lock ? new Date(Date.now() + PIN_LOCK_MINUTES * 60_000).toISOString() : null,
      })
      .eq("id", code.id);
    redirect(`/q/${shortId}?code=${lock ? "gesperrt" : "falsch"}`);
  }

  await admin.from("codes").update({ pin_fail_count: 0, pin_locked_until: null }).eq("id", code.id);
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
