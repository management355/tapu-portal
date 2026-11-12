"use client";

import { useEffect, useRef, useState } from "react";

// Startet das Video von selbst, sobald es im Bild ist. Browser erlauben das nur ohne Ton,
// deshalb beginnt es stumm und bietet einen Knopf zum Einschalten des Tons.
export function ExplainerVideo({
  src,
  poster,
  label,
  soundOn,
  lang,
}: {
  src: string;
  poster: string;
  label: string;
  soundOn: string;
  lang: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pausedByScroll = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused && (video.currentTime === 0 || pausedByScroll)) {
            video.play().catch(() => {});
          }
          pausedByScroll = false;
        } else if (!video.paused) {
          video.pause();
          pausedByScroll = true;
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function enableSound() {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  return (
    <div className="lp-video-frame">
      <video
        ref={ref}
        controls
        muted
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        lang={lang}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted || event.currentTarget.volume === 0)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {muted && (
        <button type="button" className="lp-sound" onClick={enableSound}>
          {soundOn}
        </button>
      )}
    </div>
  );
}
