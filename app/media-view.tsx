import { kindFromPath } from "@/lib/media";
import { RotatableVideo } from "./rotatable-video";

// Zeigt Bild, Audio oder Video aus dem Speicher an.
// rotation: in der Videodatei vermerkte Drehung in Grad, damit sie auch dort stimmt, wo der Browser sie übergeht.
export function MediaView({ path, url, label, rotation = 0 }: { path: string | null; url: string | null; label: string; rotation?: number }) {
  if (!path || !url) return null;
  const kind = kindFromPath(path);
  if (kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="media" src={url} alt={label} />;
  }
  if (kind === "audio") {
    return <audio className="media" src={url} controls preload="metadata" aria-label={label} />;
  }
  if (kind === "video") {
    if (rotation % 360 !== 0) return <RotatableVideo src={url} rotation={rotation} label={label} playLabel="Abspielen" />;
    return <video className="media" src={url} controls playsInline preload="metadata" aria-label={label} />;
  }
  return null;
}
