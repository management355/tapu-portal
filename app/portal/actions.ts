"use server";

import { revalidatePath } from "next/cache";
import { hashPin, isValidPin } from "@/lib/pin";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { normalizeShortId } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

function back(params: Record<string, string>): never {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `/portal?${query}` : "/portal");
}

// Knopf aus der Fabrik ins eigene Konto uebernehmen.
export async function claimCode(formData: FormData) {
  const shortId = normalizeShortId(String(formData.get("short_id") ?? ""));
  if (!shortId) back({ error: "invalid_id" });
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_code", { p_short_id: shortId });
  if (error) {
    const known = ["code_limit_reached", "code_not_claimable", "not_authenticated"];
    back({ error: known.find((k) => error.message.includes(k)) ?? "claim" });
  }
  revalidatePath("/portal");
  back({ notice: "claimed" });
}

// Eigenen Code ohne Knopf anlegen (z. B. zum Ausdrucken).
export async function createCode(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const supabase = await createClient();
  const { error } = await supabase.from("codes").insert({ title: title || null });
  if (error) back({ error: "create" });
  revalidatePath("/portal");
  back({ notice: "created" });
}

// Titel, Ziel und Status eines eigenen Codes aendern.
export async function updateCode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const target = String(formData.get("target") ?? "");
  const isActive = formData.get("is_active") === "on";

  let patch: {
    title: string | null;
    is_active: boolean;
    target_type: "message" | "archive" | null;
    message_id: string | null;
    archive_item_id: string | null;
  } = {
    title: title || null,
    is_active: isActive,
    target_type: null,
    message_id: null,
    archive_item_id: null,
  };
  if (target.startsWith("archive:")) {
    patch = { ...patch, target_type: "archive", archive_item_id: target.slice(8) };
  } else if (target.startsWith("message:")) {
    patch = { ...patch, target_type: "message", message_id: target.slice(8) };
  }

  const pinRequired = formData.get("pin_required") === "on";
  const pin = String(formData.get("pin") ?? "").trim();
  if (pin !== "" && !isValidPin(pin)) back({ error: "pin_format" });

  const supabase = await createClient();
  // Die Zugriffsregeln lassen nur eigene Knöpfe durch; das Ergebnis belegt zugleich den Besitz.
  const { data: updated, error } = await supabase
    .from("codes")
    .update(patch)
    .eq("id", id)
    .select("id, has_pin, pin_required")
    .maybeSingle();
  if (error || !updated) back({ error: "update" });

  // Zahlencode: offen oder geheim, und optional ein neuer Code. Läuft über den Server,
  // damit der Prüfwert nie im Browser landet.
  const hasPin = updated!.has_pin === true || pin !== "";
  if (pinRequired && !hasPin) back({ error: "pin_missing" });
  if (pin !== "" || pinRequired !== (updated!.pin_required === true)) {
    const admin = createAdminClient();
    if (!admin) back({ error: "update" });
    const pinPatch: { pin_required: boolean; pin_hash?: string; pin_fail_count?: number; pin_locked_until?: null } = {
      pin_required: pinRequired,
    };
    if (pin !== "") {
      pinPatch.pin_hash = hashPin(pin);
      pinPatch.pin_fail_count = 0;
      pinPatch.pin_locked_until = null;
    }
    const { error: pinError } = await admin!.from("codes").update(pinPatch).eq("id", id);
    if (pinError) back({ error: "update" });
  }
  revalidatePath("/portal");
  back({ notice: "saved" });
}
