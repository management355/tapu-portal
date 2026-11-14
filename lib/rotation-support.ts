// Prüft einmal je Seitenaufruf, ob dieser Browser die in Videodateien vermerkte Drehung beachtet.
// Dazu laden wir ein winziges Testvideo, das quer gespeichert und als "hochkant" vermerkt ist:
// Meldet der Browser es hochkant, beachtet er den Vermerk.
let cached: Promise<boolean> | null = null;

export function browserHonorsRotation(): Promise<boolean> {
  if (cached) return cached;
  cached = new Promise<boolean>((resolve) => {
    const probe = document.createElement("video");
    const done = (value: boolean) => { resolve(value); probe.removeAttribute("src"); probe.load(); };
    const timer = window.setTimeout(() => done(true), 5000);
    probe.muted = true;
    probe.preload = "metadata";
    probe.onloadedmetadata = () => { window.clearTimeout(timer); done(probe.videoHeight > probe.videoWidth); };
    // Lässt sich das Testvideo nicht laden, gehen wir vom Normalfall aus und drehen nichts.
    probe.onerror = () => { window.clearTimeout(timer); done(true); };
    probe.src = "/rotation-test.mp4";
  });
  return cached;
}
