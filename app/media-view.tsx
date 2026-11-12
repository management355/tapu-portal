import { kindFromPath } from "@/lib/media";

// Zeigt Bild, Audio oder Video aus dem Speicher an.
export function MediaView({ path, url, label }: { path: string | null; url: string | null; label: string }) {
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
    return <video className="media" src={url} controls playsInline preload="metadata" aria-label={label} />;
  }
  return null;
}
