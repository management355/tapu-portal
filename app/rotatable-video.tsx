"use client";

import { useRef, useState } from "react";
import type { VideoHint } from "@/lib/video-rotation";

// Video-Vorschau, die ein falsch herum angezeigtes Handy-Video aufrichtet: von selbst, wenn der
// Browser die in der Datei vermerkte Drehung übergeht, und sonst über die Schaltfläche "drehen".
export function RotatableVideo({ src, hint, rotateLabel, playLabel }: { src: string; hint: VideoHint | null; rotateLabel: string; playLabel: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [manual, setManual] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Meldet der Browser dieselbe Breite und Höhe wie die ungedrehten Bilder, hat er die Drehung nicht angewandt.
  const ignored = !!size && !!hint && (hint.rotation === 90 || hint.rotation === 270) && hint.width !== hint.height && size.w === hint.width && size.h === hint.height;
  const turn = ((ignored && hint ? hint.rotation / 90 : 0) + manual) % 4;
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
        <video ref={video} className="media" src={src} controls playsInline preload="metadata" {...events} />
      ) : (
        <div className="rot-frame" style={{ aspectRatio: sideways ? `${size.h} / ${size.w}` : `${size.w} / ${size.h}` }}>
          <video
            ref={video}
            src={src}
            playsInline
            preload="metadata"
            onClick={toggle}
            style={{ width: sideways ? `${(size.w / size.h) * 100}%` : "100%", transform: `translate(-50%, -50%) rotate(${turn * 90}deg)` }}
            {...events}
          />
          {!playing && <button type="button" className="rot-play" onClick={toggle} aria-label={playLabel}>▶</button>}
        </div>
      )}
      <button type="button" className="secondary rot-turn" onClick={() => setManual((value) => (value + 1) % 4)}>↻ {rotateLabel}</button>
    </div>
  );
}
