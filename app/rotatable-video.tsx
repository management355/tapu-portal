"use client";

import { useEffect, useRef, useState } from "react";
import { browserHonorsRotation } from "@/lib/rotation-support";

// Zeigt ein Video und richtet es auf, wenn der Browser die in der Datei vermerkte Drehung
// übergeht (dann lägen Hochkant-Videos vom Handy auf der Seite). Mit rotateLabel gibt es
// zusätzlich eine Schaltfläche zum Drehen von Hand.
export function RotatableVideo({ src, rotation, label, rotateLabel, playLabel }: {
  src: string; rotation: number; label?: string; rotateLabel?: string; playLabel: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [honors, setHonors] = useState(true);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [manual, setManual] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    if (rotation % 360 !== 0) void browserHonorsRotation().then((value) => { if (active) setHonors(value); });
    return () => { active = false; };
  }, [rotation]);

  const turn = ((honors ? 0 : Math.round(rotation / 90)) + manual + 4) % 4;
  const sideways = turn % 2 === 1;

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (element.paused) void element.play(); else element.pause();
  }

  const events = {
    onLoadedMetadata: (event: React.SyntheticEvent<HTMLVideoElement>) => setSize({ w: event.currentTarget.videoWidth, h: event.currentTarget.videoHeight }),
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
  };

  return (
    <div className="rot-video">
      {turn === 0 || !size ? (
        <video ref={video} className="media" src={src} controls playsInline preload="metadata" aria-label={label} {...events} />
      ) : (
        <div className="rot-frame" style={{ aspectRatio: sideways ? `${size.h} / ${size.w}` : `${size.w} / ${size.h}` }}>
          <video
            ref={video}
            src={src}
            playsInline
            preload="metadata"
            aria-label={label}
            onClick={toggle}
            style={{ width: sideways ? `${(size.w / size.h) * 100}%` : "100%", transform: `translate(-50%, -50%) rotate(${turn * 90}deg)` }}
            {...events}
          />
          {!playing && <button type="button" className="rot-play" onClick={toggle} aria-label={playLabel}>▶</button>}
        </div>
      )}
      {rotateLabel && (
        <button type="button" className="secondary rot-turn" onClick={() => setManual((value) => (value + 1) % 4)}>↻ {rotateLabel}</button>
      )}
    </div>
  );
}
