import { redirect } from "next/navigation";
import { SiteHead } from "@/app/site-head";
import { getAccount } from "@/lib/account";
import { PortalNav } from "../nav";
import { deleteAccount } from "./actions";

const ERRORS: Record<string, string> = {
  confirm: "Bitte bestätige mit dem Haken, dass du dein Konto löschen willst.",
  config: "Das Konto kann gerade nicht gelöscht werden. Bitte schreib uns eine E-Mail.",
  delete: "Das Löschen ist fehlgeschlagen. Bitte versuche es noch einmal oder schreib uns.",
};

export default async function KontoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const account = await getAccount();
  if (!account) redirect(`/login?next=${encodeURIComponent("/portal/konto")}`);

  return (
    <main>
      <SiteHead />
      <h1>Konto</h1>
      <PortalNav current="/portal/konto" isAdmin={account.isAdmin} />

      {error && ERRORS[error] && <div className="card error" role="alert">{ERRORS[error]}</div>}

      <div className="card stack">
        <div>
          <div className="muted small">E-Mail</div>
          <div>{account.email}</div>
        </div>
        <div>
          <div className="muted small">Stufe</div>
          <div>{account.plan?.name ?? "Frei"}</div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="secondary">Abmelden</button>
        </form>
      </div>

      <h2>Konto löschen</h2>
      <form className="card stack" action={deleteAccount}>
        <p>
          Dabei werden dein Profil, deine Botschaften und deine hochgeladenen Dateien endgültig gelöscht.
          Deine Knöpfe werden wieder frei und zeigen keine Botschaft mehr. Das lässt sich nicht rückgängig
          machen.
        </p>
        <label className="check">
          <input type="checkbox" name="confirm" />
          Ja, ich möchte mein Konto endgültig löschen.
        </label>
        <div><button className="secondary">Konto löschen</button></div>
      </form>
    </main>
  );
}
