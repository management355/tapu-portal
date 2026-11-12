import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Client fuer Serverseiten und Server Actions. Arbeitet mit den Rechten des
// angemeldeten Nutzers; die Zugriffsregeln der Datenbank gelten.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Serverseiten lassen sich keine Cookies setzen. Die Sitzung
          // wird in proxy.ts aufgefrischt, deshalb ist das unkritisch.
        }
      },
    },
  });
}
