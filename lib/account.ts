import { createClient } from "@/lib/supabase/server";

export type Plan = {
  id: string;
  name: string;
  code_limit: number;
  uploads_allowed: boolean;
  storage_limit_mb: number;
};

export type Account = {
  userId: string;
  email: string | null;
  isAdmin: boolean;
  plan: Plan | null;
};

// Angemeldeter Nutzer mit Rolle und Abo-Stufe, oder null.
export async function getAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, subscription] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, plans(id, name, code_limit, uploads_allowed, storage_limit_mb)")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const status = subscription.data?.status ?? "";
  const plan = ["active", "trialing", "past_due"].includes(status)
    ? ((subscription.data?.plans ?? null) as unknown as Plan | null)
    : null;

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: profile.data?.role === "admin",
    plan,
  };
}
