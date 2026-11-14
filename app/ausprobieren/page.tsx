import type { Metadata } from "next";
import Link from "next/link";
import { LANGS, TRY_STRINGS, getLang } from "@/lib/i18n";
import { TryIt } from "./try-it";

export const metadata: Metadata = { title: "taPu – Ausprobieren" };

// Botschaft ausprobieren, ohne Konto: alles passiert nur im Browser.
export default async function TryPage() {
  const lang = await getLang();
  const t = TRY_STRINGS[lang];
  return (
    <main className="try-page" lang={lang}>
      <div className="scan-head">
        <Link href="/" className="scan-logo" aria-label={`taPu, ${t.home}`}>taPu</Link>
        <nav className="scan-langs" aria-label={t.language}>
          {LANGS.map((code) => (
            <a key={code} href={`/lang/${code}?next=%2Fausprobieren`} hrefLang={code} aria-current={code === lang ? "true" : undefined}>
              {code.toUpperCase()}
            </a>
          ))}
        </nav>
      </div>
      <h1>{t.title}</h1>
      <p className="try-lead">{t.lead}</p>
      <TryIt t={t} />
      <p className="small"><Link href="/q/beispiel22">{t.example}</Link></p>
    </main>
  );
}
