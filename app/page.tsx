import Link from "next/link";
import { isConfigured } from "@/lib/supabase/env";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ konto?: string }>;
}) {
  const { konto } = await searchParams;
  return (
    <main>
      <div className="face" aria-hidden="true">:x</div>
      <h1>Ein Knopf. Eine Botschaft.</h1>
      <p className="muted">
        Tippe den Knopf mit deinem Handy an und sieh, was jemand für dich
        hinterlegt hat. Oder hinterlege selbst etwas.
      </p>
      {konto === "geloescht" && (
        <div className="card notice" role="status">Dein Konto wurde gelöscht.</div>
      )}
      {!isConfigured() && (
        <div className="card error">
          Die Verbindung zur Datenbank ist noch nicht eingerichtet. Es fehlen
          die Angaben NEXT_PUBLIC_SUPABASE_URL und
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
        </div>
      )}
      <div className="row">
        <Link className="button" href="/portal">Zum Portal</Link>
        <Link className="button secondary" href="/login">Anmelden</Link>
      </div>
    </main>
  );
}
