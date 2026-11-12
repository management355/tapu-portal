import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// Client mit dem geheimen Schluessel. Umgeht die Zugriffsregeln und darf
// deshalb nur in Servercode verwendet werden, der selbst prueft, was er
// herausgibt (Scan-Seite).
export function createAdminClient(): SupabaseClient | null {
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";
  if (supabaseUrl === "" || secret === "") return null;
  return createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
