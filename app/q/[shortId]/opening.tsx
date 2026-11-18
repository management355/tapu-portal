"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Öffnungs-Animation der Scan-Seite: Der Schriftzug taPu flattert herein, beim Antippen gibt es
// Feuerwerk und Jingle, danach erscheint die Botschaft.
// - Ton darf ein Browser erst nach einem Antippen abspielen, deshalb startet der Jingle mit dem Tippen.
// - Beim ersten Öffnen auf einem Gerät läuft die volle Fassung, danach nur eine kurze ohne Ton.
// - Wer im Gerät „Bewegung reduzieren“ eingestellt hat, sieht die Botschaft sofort.

const JINGLE = "/sounds/tapu-jingle.mp3";
const BOOM_MS = 2300; // Länge des Jingles plus Ausklang
const SHORT_MS = 1000;
const FADE_MS = 350;
const COLORS = ["#ff5a1f", "#2437ff", "#111111", "#ffc21f"];

type Start = "full" | "short" | "none";
type Stage = "fly" | "boom" | "short" | "out" | "done";

// Einmal je Seitenaufruf festgelegt, damit sich die Fassung nicht mitten im Ablauf ändert.
const starts = new Map<string, Start>();

function clientStart(shortId: string): Start {
  const known = starts.get(shortId);
  if (known) return known;
  let start: Start = "full";
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) start = "none";
    else if (window.localStorage.getItem(`tapu_gesehen_${shortId}`)) start = "short";
  } catch {
    // Ohne Zugriff auf den Gerätespeicher läuft die volle Fassung.
  }
  starts.set(shortId, start);
  return start;
}

const subscribe = () => () => {};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string };

// Feuerwerk auf einer Zeichenfläche: Punkte, die auseinanderfliegen, fallen und verblassen.
function runFireworks(canvas: HTMLCanvasElement, bursts: number, spanMs: number): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);

  const particles: Particle[] = [];
  const burst = (first: boolean) => {
    const x = first ? width / 2 : width * (0.15 + Math.random() * 0.7);
    const y = first ? height * 0.38 : height * (0.12 + Math.random() * 0.5);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = first ? 70 : 46;
    const power = (first ? 7.5 : 5.5) * Math.min(1.4, Math.max(0.8, width / 420));
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = power * (0.45 + Math.random() * 0.75);
      const max = 50 + Math.random() * 30;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: max, max,
        size: 2.5 + Math.random() * 3.5,
        color: Math.random() < 0.25 ? COLORS[Math.floor(Math.random() * COLORS.length)] : color,
      });
    }
  };

  const timers: number[] = [];
  for (let i = 0; i < bursts; i += 1) {
    timers.push(window.setTimeout(() => burst(i === 0), i === 0 ? 0 : 120 + ((spanMs - 300) * i) / bursts + Math.random() * 120));
  }

  let frame = 0;
  let last = performance.now();
  const tick = (now: number) => {
    const step = Math.min(2.5, (now - last) / 16.7);
    last = now;
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= step;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vx *= 1 - 0.035 * step;
      p.vy = p.vy * (1 - 0.035 * step) + 0.11 * step;
      p.x += p.vx * step;
      p.y += p.vy * step;
      const fade = p.life / p.max;
      ctx.globalAlpha = Math.min(1, fade * 1.6);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + fade * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame = window.requestAnimationFrame(tick);
  };
  frame = window.requestAnimationFrame(tick);

  return () => {
    window.cancelAnimationFrame(frame);
    timers.forEach((t) => window.clearTimeout(t));
  };
}

function Wing({ side }: { side: "left" | "right" }) {
  return (
    <span className={`opening-wing opening-wing-${side}`} aria-hidden="true">
      <svg viewBox="0 0 72 44" width="72" height="44">
        <path
          d="M3 33 C13 8 40 1 69 4 C63 12 57 15 50 17 C56 18 59 21 61 25 C53 25 48 26 42 27 C46 30 47 33 48 36 C35 38 17 38 3 33 Z"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Opening({
  shortId,
  play,
  hint,
  skipLabel,
  children,
}: {
  shortId: string;
  play: boolean;
  hint: string;
  skipLabel: string;
  children: React.ReactNode;
}) {
  // Auf dem Server und beim ersten Zeichnen im Browser gilt die volle Fassung; erst danach wird
  // nachgesehen, ob das Gerät den Knopf schon kennt.
  const start = useSyncExternalStore<Start>(subscribe, () => clientStart(shortId), () => "full");
  const [progress, setProgress] = useState<"start" | "boom" | "out" | "done">("start");
  const stage: Stage =
    !play || start === "none" || progress === "done" ? "done"
    : progress === "out" ? "out"
    : progress === "boom" ? "boom"
    : start === "short" ? "short"
    : "fly";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const finish = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    try {
      window.localStorage.setItem(`tapu_gesehen_${shortId}`, "1");
    } catch {
      // Dann läuft beim nächsten Mal wieder die volle Fassung.
    }
    setProgress("out");
    later(() => setProgress("done"), FADE_MS);
  }, [later, shortId]);

  // Jingle schon laden, damit er beim Antippen sofort startet.
  useEffect(() => {
    if (stage !== "fly") return;
    const audio = new Audio(JINGLE);
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audioRef.current = null;
    };
  }, [stage]);

  // Feuerwerk: groß nach dem Antippen, klein in der Kurzfassung.
  useEffect(() => {
    if (stage !== "boom" && stage !== "short") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return runFireworks(canvas, stage === "boom" ? 7 : 2, stage === "boom" ? BOOM_MS - 500 : 400);
  }, [stage]);

  // Die Kurzfassung endet von selbst.
  useEffect(() => {
    if (stage !== "short") return;
    const timer = window.setTimeout(finish, SHORT_MS);
    return () => window.clearTimeout(timer);
  }, [stage, finish]);

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const tap = () => {
    if (stage === "fly") {
      // Der Schriftzug bleibt, wo er gerade fliegt, und gleitet von dort in die Mitte.
      const flyer = flyerRef.current;
      if (flyer) {
        flyer.style.transform = window.getComputedStyle(flyer).transform;
        flyer.style.animation = "none";
        void flyer.offsetWidth;
        flyer.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
        flyer.style.transform = "translate(0, 0) scale(1.25)";
      }
      audioRef.current?.play().catch(() => {});
      setProgress("boom");
      later(finish, BOOM_MS);
    } else if (stage === "boom" || stage === "short") {
      audioRef.current?.pause();
      finish();
    }
  };

  const skip = () => {
    audioRef.current?.pause();
    finish();
  };

  if (!play) return <>{children}</>;

  return (
    <>
      {stage !== "done" && (
        <div className={`opening opening-${stage}`}>
          <button type="button" className="opening-tap" onClick={tap} aria-label={hint} autoFocus />
          <canvas ref={canvasRef} className="opening-sky" aria-hidden="true" />
          <div className="opening-stage" aria-hidden="true">
            <div className="opening-flyer" ref={flyerRef}>
              <div className="opening-bird">
                <Wing side="left" />
                <span className="opening-logo">taPu</span>
                <Wing side="right" />
              </div>
            </div>
          </div>
          {stage === "fly" && <p className="opening-hint" aria-hidden="true">{hint}</p>}
          {(stage === "fly" || stage === "boom") && (
            <button type="button" className="opening-skip" onClick={skip}>{skipLabel}</button>
          )}
        </div>
      )}
      <div className={stage === "done" ? "opening-content opening-shown" : "opening-content opening-hidden"}>
        {children}
      </div>
      <noscript>
        <style>{".opening{display:none}.opening-content.opening-hidden{visibility:visible}"}</style>
      </noscript>
    </>
  );
}
