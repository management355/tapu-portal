import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Client fuer den Browser. Wird nur fuer das Hochladen von Dateien ueber
// einen vom Server ausgestellten, einmaligen Upload-Link verwendet.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
