import { BackButton } from "@/app/back-button";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExplainerVideo } from "@/app/explainer-video";
import { BACK_LABEL, LANGS, SOUND_ON, getLang, landingStrings } from "@/lib/i18n";
import { IDEA_SLUGS, IDEA_STYLE, ideaTexts, isIdeaSlug } from "@/lib/ideas";
import { isConfigured, supabaseUrl } from "@/lib/supabase/env";

const MEDIA_BASE = `${supabaseUrl}/storage/v1/object/public/site-media`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isIdeaSlug(slug)) return {};
  const idea = ideaTexts(await getLang()).ideas[slug];
  return { title: `taPu – ${idea.title}`, description: idea.lead };
}

// Eine Idee im Detail: wofür der Knopf an dieser Stelle gut ist, mit kurzem Video.
export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isIdeaSlug(slug)) notFound();

  const lang = await getLang();
  const t = landingStrings(lang);
  const { common, ideas } = ideaTexts(lang);
  const idea = ideas[slug];
  const others = IDEA_SLUGS.filter((other) => other !== slug);
  const back = encodeURIComponent(`/ideen/${slug}`);

  return (
    <div className="lp" lang={lang}>
      <header className="lp-head">
        <div className="row">
          <BackButton fallback="/#wo" label={BACK_LABEL[lang]} />
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
        <section className={`idea-hero lp-tile-${IDEA_STYLE[slug]}`}>
          <div className="lp-wrap">
            <div className="lp-tile-tag">{idea.tag}</div>
            <h1>{idea.headline}</h1>
            <p className="idea-lead">{idea.lead}</p>
          </div>
        </section>

        <section className="lp-wrap idea-body">
          {isConfigured() && (
            <div className="lp-video">
              <ExplainerVideo
                src={`${MEDIA_BASE}/tapu-idee-${slug}.mp4`}
                poster={`${MEDIA_BASE}/tapu-idee-${slug}.jpg`}
                label={common.videoLabel}
                soundOn={SOUND_ON[lang]}
                lang={lang}
              />
            </div>
          )}
          <p className="idea-story">{idea.story}</p>
        </section>

        <section className="lp-band-grey">
          <div className="lp-wrap lp-section">
            <h2>{common.examplesH}</h2>
            <ol className="lp-steps">
              {idea.examples.map(([title, text], index) => (
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
          <div className="idea-tip">
            <h2>{common.tipH}</h2>
            <p>{idea.tip}</p>
            <Link href="/ausprobieren" className="lp-cta">{t.ctaTry}</Link>
          </div>
          <h2 className="idea-more">{common.moreH}</h2>
          <div className="lp-tiles">
            {others.map((other) => (
              <Link href={`/ideen/${other}`} className={`lp-tile lp-tile-${IDEA_STYLE[other]}`} key={other}>
                <div className="lp-tile-tag">{ideas[other].tag}</div>
                <div>
                  <h3>{ideas[other].title}</h3>
                  <p>{ideas[other].headline}</p>
                  <span className="lp-tile-more">{common.open} <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
