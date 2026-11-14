// Liest aus einer MP4- oder MOV-Datei, wie das Video gedreht gehört (0, 90, 180 oder 270 Grad)
// und wie breit und hoch die Bilder ungedreht gespeichert sind. Handys speichern Hochkant-Videos
// oft quer und merken sich die Drehung nur als Zusatzangabe; manche Browser übergehen sie.
export type VideoHint = { rotation: 0 | 90 | 180 | 270; width: number; height: number };

const MAX_MOOV_BYTES = 16 * 1024 * 1024;

function boxType(view: DataView, offset: number) {
  return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
}

// Größe eines Kastens samt Kopf; 0 heißt "nicht lesbar".
function boxSize(view: DataView, offset: number, end: number) {
  if (offset + 8 > end) return { size: 0, head: 8 };
  const size = view.getUint32(offset);
  if (size === 1) {
    if (offset + 16 > end) return { size: 0, head: 16 };
    return { size: view.getUint32(offset + 8) * 2 ** 32 + view.getUint32(offset + 12), head: 16 };
  }
  return { size: size === 0 ? end - offset : size, head: 8 };
}

function readTkhd(view: DataView, start: number): VideoHint | null {
  const version = view.getUint8(start);
  const matrix = start + (version === 1 ? 52 : 40);
  if (matrix + 44 > view.byteLength) return null;
  const a = view.getInt32(matrix), b = view.getInt32(matrix + 4), c = view.getInt32(matrix + 12), d = view.getInt32(matrix + 16);
  const width = view.getUint32(matrix + 36) / 65536, height = view.getUint32(matrix + 40) / 65536;
  if (width === 0 || height === 0) return null; // Tonspur
  let rotation: VideoHint["rotation"] = 0;
  if (a === 0 && d === 0 && b > 0 && c < 0) rotation = 90;
  else if (a === 0 && d === 0 && b < 0 && c > 0) rotation = 270;
  else if (a < 0 && d < 0) rotation = 180;
  return { rotation, width: Math.round(width), height: Math.round(height) };
}

function findVideoTrack(view: DataView, start: number, end: number): VideoHint | null {
  let offset = start;
  while (offset + 8 <= end) {
    const { size, head } = boxSize(view, offset, end);
    if (size < head) return null;
    const type = boxType(view, offset + 4);
    if (type === "trak") {
      const found = findVideoTrack(view, offset + head, Math.min(offset + size, end));
      if (found) return found;
    } else if (type === "tkhd") {
      return readTkhd(view, offset + head);
    }
    offset += size;
  }
  return null;
}

export async function readVideoHint(file: File): Promise<VideoHint | null> {
  try {
    let offset = 0;
    while (offset + 8 <= file.size) {
      const headView = new DataView(await file.slice(offset, offset + 16).arrayBuffer());
      const { size, head } = boxSize(headView, 0, headView.byteLength);
      const total = size === headView.byteLength && headView.getUint32(0) === 0 ? file.size - offset : size;
      if (total < head) return null;
      if (boxType(headView, 4) === "moov") {
        if (total > MAX_MOOV_BYTES) return null;
        const view = new DataView(await file.slice(offset, offset + total).arrayBuffer());
        return findVideoTrack(view, head, view.byteLength);
      }
      offset += total;
    }
  } catch {
    // Unlesbare Datei: dann eben ohne Hinweis.
  }
  return null;
}
