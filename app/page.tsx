import Link from "next/link";
import { ACCOUNT_DELETED, LANGS, VIDEO_NOTE, getLang, landingStrings } from "@/lib/i18n";
import { QR_PATH } from "@/lib/landing-qr";
import { isConfigured, supabaseUrl } from "@/lib/supabase/env";

// Das Erklärvideo liegt im öffentlichen Ordner "site-media" unseres Supabase-Speichers.
const MEDIA_BASE = `${supabaseUrl}/storage/v1/object/public/site-media`;
const VIDEO_URL = `${MEDIA_BASE}/tapu-erklaervideo-de.mp4`;
const POSTER_URL = `${MEDIA_BASE}/tapu-erklaervideo-poster.jpg`;

function Qr({ x, y, size }: { x: number; y: number; size: number }) {
  const pad = size * 0.08;
  return (
    <>
      <rect x={x - pad} y={y - pad} width={size + 2 * pad} height={size + 2 * pad} rx={pad * 0.75} fill="#FFFFFF" stroke="none" />
      <use href="#tapu-qr" x={x} y={y} width={size} height={size} />
    </>
  );
}

function Dot({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#F0B35E" stroke="none" />
      <circle cx={cx} cy={cy} r={r + 6} />
    </>
  );
}

const ICONS = [
  <>
    <circle cx="160" cy="34" r="22" />
    <path d="M138 62h44l14 58h-72z" />
    <path d="M146 120v34M174 120v34M138 72l-28 30M182 72l28 30" />
    <Dot cx={174} cy={158} r={6} />
  </>,
  <>
    <path d="M110 30l-50 26 16 30 22-10v72h124V76l22 10 16-30-50-26c-8 14-22 20-50 20s-42-6-50-20z" />
    <Dot cx={196} cy={122} r={6} />
  </>,
  <>
    <rect x="50" y="18" width="220" height="104" rx="3" />
    <path d="M110 122v36M210 122v36M90 158h140" />
    <path d="M70 44h70M70 62h50M70 80h60" />
    <Qr x={196} y={40} size={54} />
  </>,
  <>
    <path d="M20 150h280M36 150V46c0-16 12-28 28-28h192c16 0 28 12 28 28v104" />
    <rect x="60" y="44" width="76" height="60" rx="4" />
    <rect x="184" y="44" width="76" height="60" rx="4" />
    <path d="M160 18v132" />
    <Qr x={200} y={52} size={44} />
    <path d="M76 62h44M76 78h30" />
  </>,
  <>
    <rect x="40" y="26" width="240" height="124" rx="3" />
    <path d="M160 40v96M178 78h84M178 96h84M178 114h60" />
    <rect x="232" y="38" width="32" height="26" />
    <Qr x={64} y={56} size={62} />
  </>,
  <>
    <Dot cx={70} cy={60} r={9} />
    <Dot cx={160} cy={112} r={13} />
    <Dot cx={250} cy={52} r={7} />
    <Dot cx={118} cy={132} r={5} />
    <Dot cx={214} cy={128} r={6} />
    <path d="M92 66l48 34M182 104l56-44" />
  </>,
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ konto?: string }>;
}) {
  const { konto } = await searchParams;
  const lang = await getLang();
  const t = landingStrings(lang);
  const tiles = [
    [t.t1, t.d1], [t.t2, t.d2], [t.t3, t.d3], [t.t4, t.d4], [t.t5, t.d5], [t.t6, t.d6],
  ];
  const steps = [
    [t.s1, t.sd1], [t.s2, t.sd2], [t.s3, t.sd3], [t.s4, t.sd4],
  ];
  const videoNote = VIDEO_NOTE[lang];

  return (
    <div className="lp" lang={lang}>
      <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <symbol id="tapu-qr" viewBox="0 0 33 33">
            <path stroke="#15111C" strokeWidth="1" strokeLinecap="butt" shapeRendering="crispEdges" d={QR_PATH} />
          </symbol>
        </defs>
      </svg>

      <header className="lp-head">
        <Link href="/" className="lp-logo">taPu</Link>
        <nav aria-label={lang === "de" ? "Hauptnavigation" : lang === "ru" ? "Главная навигация" : "Main navigation"}>
          <a href="#ueberall">{t.navWhere}</a>
          <a href="#video">{t.navHow}</a>
          <div className="lp-langs">
            {LANGS.map((code) => (
              <a key={code} href={`/lang/${code}`} hrefLang={code} aria-current={code === lang ? "true" : undefined}>
                {code.toUpperCase()}
              </a>
            ))}
          </div>
          <Link href="/login" className="lp-login">{t.login}</Link>
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
            <h1>{t.h1}</h1>
            <p className="lp-lead">{t.sub}</p>
            <div className="lp-actions">
              <Link href="/portal" className="lp-cta">{t.cta}</Link>
              <a href="#video" className="lp-link">{t.ctaVideo}</a>
            </div>
          </div>
          <div className="lp-hero-art">
            <svg role="img" aria-label="taPu: Logo, QR-Code, A9GSB NE6H9" viewBox="0 0 600 600">
              <defs>
                <radialGradient id="tapu-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="55%" stopColor="#F0B35E" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#F0B35E" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle className="lp-glow" cx="300" cy="300" r="300" fill="url(#tapu-glow)" />
              <circle cx="300" cy="300" r="236" fill="#1F1929" stroke="#F0B35E" strokeWidth="3" />
              <circle cx="300" cy="300" r="214" fill="none" stroke="#5B4A3A" strokeWidth="1.5" />
              <text x="300" y="168" textAnchor="middle" className="lp-svg-logo" fontSize="58" fontWeight="800" letterSpacing="-1" fill="#F2EADF">taPu</text>
              <rect x="190" y="190" width="220" height="220" rx="10" fill="#FFFFFF" />
              <use href="#tapu-qr" x="204" y="204" width="192" height="192" />
              <text x="300" y="458" textAnchor="middle" className="lp-svg-code" fontSize="26" fontWeight="700" letterSpacing="2" fill="#F0B35E">A9GSB·NE6H9</text>
            </svg>
          </div>
        </section>

        <section id="ueberall" className="lp-band">
          <div className="lp-wrap lp-section">
            <div className="lp-intro">
              <div className="lp-eyebrow">{t.whereEyebrow}</div>
              <h2>{t.whereH}</h2>
              <p className="lp-lead">{t.whereSub}</p>
            </div>
            <div className="lp-tiles">
              {tiles.map(([title, text], index) => (
                <div className="lp-tile" key={title}>
                  <svg aria-hidden="true" viewBox="0 0 320 170" fill="none" stroke="#F0B35E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[index]}
                  </svg>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="video" className="lp-band lp-band-alt">
          <div className="lp-wrap lp-section">
            <div className="lp-intro">
              <div className="lp-eyebrow">{t.videoEyebrow}</div>
              <h2>{t.videoH}</h2>
            </div>
            {isConfigured() && <div className="lp-video">
              <video controls playsInline preload="metadata" poster={POSTER_URL} aria-label={t.videoH} lang="de">
                <source src={VIDEO_URL} type="video/mp4" />
              </video>
              {videoNote && <p className="lp-video-note">{videoNote}</p>}
            </div>}
            <ol className="lp-steps">
              {steps.map(([title, text], index) => (
                <li key={title}>
                  <div className="lp-step-no">0{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-band">
          <div className="lp-wrap lp-end">
            <h2>{t.endH}</h2>
            <p className="lp-lead">{t.endSub}</p>
            <Link href="/portal" className="lp-cta lp-cta-big">{t.cta}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
