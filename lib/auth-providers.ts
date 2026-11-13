import "server-only";
import { isConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

export const SOCIAL_PROVIDERS = ["google", "facebook"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export const SOCIAL_LABELS: Record<SocialProvider, string> = {
  google: "Mit Google anmelden",
  facebook: "Mit Facebook anmelden",
};

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

// Fragt Supabase, welche Anmeldewege im Projekt eingeschaltet sind. So erscheint ein
// Knopf erst, wenn der Anbieter dort wirklich eingerichtet ist.
export async function enabledSocialProviders(): Promise<SocialProvider[]> {
  if (!isConfigured()) return [];
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabasePublishableKey },
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const settings = (await response.json()) as { external?: Record<string, boolean> };
    return SOCIAL_PROVIDERS.filter((provider) => settings.external?.[provider] === true);
  } catch {
    return [];
  }
}
