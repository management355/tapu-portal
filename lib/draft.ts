// Entwurf aus "Ausprobieren": Nur der Text wird im Browser gemerkt, damit er nach der
// Anmeldung im Formular wieder da ist. Er verlässt das Gerät dabei nicht.
const KEY = "tapu_entwurf";

export function saveDraft(text: string): void {
  try {
    if (text.trim() === "") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, text.slice(0, 2000));
  } catch {
    // Ohne Speicher im Browser geht der Entwurf verloren, sonst nichts.
  }
}

export function readDraft(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
