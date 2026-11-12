// Erlaubte Dateitypen. Die Endung wird auf dem Server aus dem Typ abgeleitet,
// nie aus dem Dateinamen des Nutzers.
export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "weba",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export const ACCEPT = Object.keys(MIME_TO_EXT).join(",");
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type MediaKind = "image" | "audio" | "video";

const EXT_TO_KIND: Record<string, MediaKind> = {
  jpg: "image", png: "image", webp: "image", gif: "image",
  mp3: "audio", m4a: "audio", aac: "audio", wav: "audio", ogg: "audio", weba: "audio",
  mp4: "video", webm: "video", mov: "video",
};

export function kindFromPath(path: string): MediaKind | null {
  const ext = path.split(".").pop() ?? "";
  return EXT_TO_KIND[ext] ?? null;
}

export const USER_BUCKET = "user-media";
export const ARCHIVE_BUCKET = "archive-media";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const USER_PATH = new RegExp(`^${UUID}/${UUID}\\.[a-z0-9]{2,4}$`);
const ARCHIVE_PATH = new RegExp(`^archive/${UUID}\\.[a-z0-9]{2,4}$`);

export function isUserPath(path: string, userId: string): boolean {
  return USER_PATH.test(path) && path.startsWith(`${userId}/`) && kindFromPath(path) !== null;
}

export function isArchivePath(path: string): boolean {
  return ARCHIVE_PATH.test(path) && kindFromPath(path) !== null;
}
