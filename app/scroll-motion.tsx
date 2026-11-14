"use client";

import { useEffect } from "react";

// Lässt Kacheln sich beim Scrollen bewegen: Jedes Element mit data-scroll-move bekommt die
// Klasse "is-passing", solange es durch die Bildschirmmitte läuft. Das Aussehen dazu steht im CSS
// und entspricht dem Effekt beim Überfahren mit der Maus.
export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-passing", entry.isIntersecting)),
      { rootMargin: "-38% 0px -38% 0px" },
    );
    document.querySelectorAll("[data-scroll-move]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}
