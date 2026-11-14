import Link from "next/link";
import { ExplainerVideo } from "./explainer-video";
import { ACCOUNT_DELETED, LANGS, PORTAL_LABEL, SOUND_ON, getLang, landingStrings } from "@/lib/i18n";
import { IDEA_SLUGS, IDEA_STYLE, ideaTexts } from "@/lib/ideas";
import { QR_PATH } from "@/lib/landing-qr";
import { isConfigured, supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Das Werbevideo liegt im öffentlichen Ordner "site-media" unseres Supabase-Speichers.
const MEDIA_BASE = `${supabaseUrl}/storage/v1/object/public/site-media`;
const POSTER_URL = `${MEDIA_BASE}/tapu-werbevideo-poster.jpg`;

// Öffentliche Beispiel-Botschaft; ihr Inhalt wird im Admin-Bereich gepflegt.
const EXAMPLE_ID = "beispiel22";

// Bilder im Abschnitt "So sieht er aus" (vorerst KI-Darstellungen).
const LOOK_IMAGES = ["hand", "seiten", "geschenk"];

const INK = "#111111";
const ORANGE = "#FF5A1F";

// Der Knopf als Zeichnung: offen (taPu) oder geheim (xtaPu).
function Knopf({ secret, label }: { secret?: boolean; label: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 600 600">
      <circle cx="300" cy="300" r="286" fill={secret ? ORANGE : INK} />
      <circle cx="300" cy="300" r="246" fill={secret ? INK : "#FFFFFF"} />
      <text x="300" y="166" textAnchor="middle" className="lp-svg-logo" fontSize="64" fontWeight="800" letterSpacing="-1.5" fill={secret ? "#FFFFFF" : INK}>
        {secret ? "xtaPu" : "taPu"}
      </text>
      <rect x="192" y="192" width="216" height="216" rx="10" fill="#FFFFFF" />
      <use href="#tapu-qr" x="206" y="206" width="188" height="188" />
      <text x="300" y="462" textAnchor="middle" className="lp-svg-code" fontSize="27" fontWeight="700" letterSpacing="2" fill={secret ? ORANGE : INK}>
        A9GSB·NE6H9
      </text>
    </svg>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ konto?: string }>;
}) {
  const { konto } = await searchParams;
  const lang = await getLang();
  const t = landingStrings(lang);
  // Angemeldete sehen statt "Anmelden" den Weg zurück in ihr Portal.
  let signedIn = false;
  if (isConfigured()) {
    const supabase = await createClient();
    signedIn = !!(await supabase.auth.getUser()).data.user;
  }
  const marquee = [...t.marquee, ...t.marquee];
  const ideaOpen = ideaTexts(lang).common.open;

  return (
    <div className="lp" lang={lang}>
      <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <symbol id="tapu-qr" viewBox="0 0 33 33">
            <path stroke={INK} strokeWidth="1" strokeLinecap="butt" shapeRendering="crispEdges" d={QR_PATH} />
          </symbol>
        </defs>
      </svg>

      <header className="lp-head">
        <Link href="/" className="lp-logo">taPu</Link>
        <nav aria-label={lang === "de" ? "Hauptnavigation" : lang === "ru" ? "Главная навигация" : "Main navigation"}>
          <a href="#knopf">{t.navLook}</a>
          <a href="#wo">{t.navWhere}</a>
          <a href="#so">{t.navHow}</a>
          <a href="#geheim">{t.navSecret}</a>
          <div className="lp-langs">
            {LANGS.map((code) => (
              <a key={code} href={`/lang/${code}`} hrefLang={code} aria-current={code === lang ? "true" : undefined}>
                {code.toUpperCase()}
              </a>
            ))}
          </div>
          <Link href={signedIn ? "/portal" : "/login"} className="lp-login">{signedIn ? PORTAL_LABEL[lang] : t.login}</Link>
        </nav>
      </header>

      <main>
        {konto === "geloescht" && (
          <div className="lp-wrap"><div className="card notice" role="status">{ACCOUNT_DELETED[lang]}</div></div>
        )}
        {!isConfigured() && (
          <div className="lp-wrap"><div className="card error">
            Die Verbindung zur Datenbank ist noch nicht eingerichtet. Es fehlen
            die Angaben NEXT_PUBLIC_SUPABASE_URL und
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
          </div></div>
        )}

        <section className="lp-hero lp-wrap">
          <div className="lp-hero-text">
            <div className="lp-eyebrow">{t.eyebrow}</div>
            <h1>{t.h1a}<br />{t.h1b}</h1>
            <p className="lp-lead">{t.sub}</p>
            <div className="lp-actions">
              <Link href="/ausprobieren" className="lp-cta">{t.ctaTry}</Link>
              <Link href={`/q/${EXAMPLE_ID}`} className="lp-link">{t.ctaExample}</Link>
            </div>
            <div className="lp-free">{t.free}</div>
          </div>
          <div className="lp-hero-art">
            <div className="lp-photo">
              <div className="lp-photo-back" aria-hidden="true" />
              <div className="lp-photo-card">
                <div className="lp-photo-image"><Knopf label="taPu: Logo, QR-Code, A9GSB NE6H9" /></div>
                <div className="lp-photo-caption">
                  <span>{t.cardCaption}</span>
                  <span className="lp-photo-no">{t.cardNo}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee-track">
            {marquee.map((word, index) => (
              <span key={index}>{word}<i>●</i></span>
            ))}
          </div>
        </div>

        <section id="knopf" className="lp-wrap lp-section">
          <div className="lp-intro">
            <h2>{t.lookH}</h2>
            <p className="lp-lead">{t.lookSub}</p>
          </div>
          <div className="lp-look">
            {t.lookItems.map(([title, text]: string[], index: number) => (
              <figure key={title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${MEDIA_BASE}/tapu-echt-${LOOK_IMAGES[index]}.jpg`} alt={`${title}. ${text}`} loading="lazy" width={1400} height={1050} />
                <figcaption>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="lp-try">
            <div className="lp-try-voice">
              <h3>{t.voiceH}</h3>
              <p>{t.voiceP}</p>
              <audio controls preload="none" src={`${MEDIA_BASE}/tapu-echt-stimme.mp3`} aria-label={t.voiceH} />
            </div>
            <div className="lp-try-demo">
              <video controls playsInline preload="none" poster={`${MEDIA_BASE}/tapu-echt-demo.jpg`} aria-label={t.demoLabel}>
                <source src={`${MEDIA_BASE}/tapu-echt-demo.mp4`} type="video/mp4" />
              </video>
              <div>
                <h3>{t.demoH}</h3>
                <p>{t.demoP}</p>
              </div>
            </div>
          </div>
          <p className="lp-look-note">{t.lookNote}</p>
        </section>

        <section id="wo" className="lp-wrap lp-section">
          <div className="lp-intro">
            <h2>{t.whereH}</h2>
            <p className="lp-lead">{t.whereSub}</p>
          </div>
          <div className="lp-tiles">
            {t.tiles.map(([tag, title, text], index) => (
              <Link href={`/ideen/${IDEA_SLUGS[index]}`} className={`lp-tile lp-tile-${IDEA_STYLE[IDEA_SLUGS[index]]}`} key={tag}>
                <div className="lp-tile-tag">{tag}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="lp-tile-more">{ideaOpen} <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="so" className="lp-band-grey">
          <div className="lp-wrap lp-section">
            <h2>{t.howH}</h2>
            {isConfigured() && (
              <div className="lp-video">
                <ExplainerVideo
                  src={`${MEDIA_BASE}/tapu-werbevideo-${lang}.mp4`}
                  poster={POSTER_URL}
                  label={t.videoLabel}
                  soundOn={SOUND_ON[lang]}
                  lang={lang}
                  key={lang}
                />
              </div>
            )}
            <ol className="lp-steps">
              {t.steps.map(([title, text], index) => (
                <li key={title}>
                  <div className="lp-step-no">{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="geheim" className="lp-wrap lp-section">
          <div className="lp-intro">
            <h2>{t.secretH}</h2>
            <p className="lp-lead">{t.secretSub}</p>
          </div>
          <div className="lp-kinds">
            <div className="lp-kind">
              <div className="lp-kind-head">
                <Knopf label="taPu" />
                <div>
                  <h3>taPu</h3>
                  <div className="lp-kind-tag">{t.openTag}</div>
                </div>
              </div>
              <ul>{t.openList.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="lp-kind lp-kind-secret">
              <div className="lp-kind-head">
                <Knopf secret label="xtaPu" />
                <div>
                  <h3>xtaPu</h3>
                  <div className="lp-kind-tag">{t.secretTag}</div>
                </div>
              </div>
              <ul>{t.secretList.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="lp-pin" aria-hidden="true"><span>4</span><span>7</span><span className="lp-pin-now" /><span className="lp-pin-empty" /></div>
            </div>
          </div>
        </section>

        <section className="lp-wrap lp-faq">
          <h2>{t.faqH}</h2>
          <div className="lp-faq-list">
            {t.faq.map(([question, answer]) => (
              <div key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-end">
          <div className="lp-wrap">
            <h2>{t.endH}</h2>
            <Link href="/ausprobieren" className="lp-cta lp-cta-ink">{t.ctaTry}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
