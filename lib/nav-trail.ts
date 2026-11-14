// Merkt sich in diesem Browser-Tab die zuletzt besuchten Seiten der Website, damit "Zurück" weiß,
// ob es eine Seite gibt, von der man abgezweigt ist. Liegt nur im Tab (sessionStorage), nicht bei uns.
const KEY = "tapu_weg";

function read(): string[] {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function recordVisit(path: string) {
  try {
    const trail = read();
    if (trail[trail.length - 1] === path) return;
    window.sessionStorage.setItem(KEY, JSON.stringify([...trail, path].slice(-20)));
  } catch {
    // Ohne Speicher gibt es eben keinen gemerkten Weg.
  }
}

// Gibt es eine andere Seite der Website, von der man auf die aktuelle gekommen ist?
export function hasPreviousPage(current: string): boolean {
  if (typeof window === "undefined") return false;
  const trail = read();
  const previous = trail[trail.length - 1] === current ? trail[trail.length - 2] : trail[trail.length - 1];
  return !!previous && previous !== current && window.history.length > 1;
}

// Nach "Zurück" ist die aktuelle Seite nicht mehr Teil des Wegs.
export function dropCurrent() {
  try {
    const trail = read();
    if (trail[trail.length - 1] === window.location.pathname) {
      window.sessionStorage.setItem(KEY, JSON.stringify(trail.slice(0, -1)));
    }
  } catch {
    // siehe oben
  }
}
