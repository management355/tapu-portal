import { BackButton } from "@/app/back-button";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExplainerVideo } from "@/app/explainer-video";
import { BACK_LABEL, LANGS, SOUND_ON, getLang, landingStrings } from "@/lib/i18n";
import { isKindSlug, kindTexts } from "@/lib/kinds";
import { isConfigured, supabaseUrl } from "@/lib/supabase/env";

const MEDIA_BASE = `${supabaseUrl}/storage/v1/object/public/site-media`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isKindSlug(slug)) return {};
  const kind = kindTexts(await getLang()).kinds[slug];
  return { title: `${kind.title} – ${kind.headline}`, description: kind.lead };
}

// Eine Knopf-Art im Detail: offen (taPu) oder geheim (xtaPu), mit kurzem Video.
export default async function KindPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isKindSlug(slug)) notFound();

  const lang = await getLang();
  const t = landingStrings(lang);
  const { common, kinds } = kindTexts(lang);
  const kind = kinds[slug];
  const other = slug === "tapu" ? "xtapu" : "tapu";
  const back = encodeURIComponent(`/knopf/${slug}`);

  return (
    <div className="lp" lang={lang}>
      <header className="lp-head">
        <div className="row">
          <BackButton fallback="/#geheim" label={BACK_LABEL[lang]} />
          <Link href="/" className="lp-logo">taPu</Link>
        </div>
        <nav aria-label={common.back}>
          <div className="lp-langs">
            {LANGS.map((code) => (
              <a key={code} href={`/lang/${code}?next=${back}`} hrefLang={code} aria-current={code === lang ? "true" : undefined}>
                {code.toUpperCase()}
              </a>
            ))}
          </div>
          <Link href="/ausprobieren" className="lp-login">{t.ctaTry}</Link>
        </nav>
      </header>

      <main>
        <section className={`idea-hero lp-tile-${slug === "tapu" ? "orange" : "ink"}`}>
          <div className="lp-wrap">
            <div className="lp-tile-tag">{kind.tag}</div>
            <h1>{kind.title}</h1>
            <p className="idea-lead"><strong>{kind.headline}</strong> {kind.lead}</p>
          </div>
        </section>

        <section className="lp-wrap idea-body">
          {isConfigured() && (
            <div className="lp-video kind-video">
              <ExplainerVideo
                src={`${MEDIA_BASE}/tapu-art-${slug}.mp4`}
                poster={`${MEDIA_BASE}/tapu-art-${slug}.jpg`}
                label={common.videoLabel}
                soundOn={SOUND_ON[lang]}
                lang={lang}
              />
            </div>
          )}
          <div>
            <p className="idea-story">{kind.story}</p>
            <p className="lp-look-note">{common.videoNote}</p>
          </div>
        </section>

        <section className="lp-band-grey">
          <div className="lp-wrap lp-section">
            <h2>{common.stepsH}</h2>
            <ol className="lp-steps">
              {kind.steps.map(([title, text], index) => (
                <li key={title}>
                  <div className="lp-step-no">{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-wrap lp-section">
          <div className="lp-kinds">
            <div className="lp-kind">
              <h2 className="kind-h">{common.forH}</h2>
              <ul>{kind.for.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="idea-tip kind-tip">
              <h2>{kind.tipH}</h2>
              <p>{kind.tip}</p>
              <Link href="/ausprobieren" className="lp-cta">{t.ctaTry}</Link>
            </div>
          </div>
          <h2 className="idea-more">{common.otherH}</h2>
          <div className="lp-tiles">
            <Link href={`/knopf/${other}`} className={`lp-tile lp-tile-${other === "tapu" ? "orange" : "ink"}`}>
              <div className="lp-tile-tag">{kinds[other].tag}</div>
              <div>
                <h3>{kinds[other].title}</h3>
                <p>{kinds[other].headline}</p>
                <span className="lp-tile-more">{common.open} <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
