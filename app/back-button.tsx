"use client";

import { useSyncExternalStore } from "react";
import { dropCurrent, hasPreviousPage } from "@/lib/nav-trail";

function subscribeNever() {
  return () => {};
}

// "Zurück" bringt an die Stelle, von der man hierher abgezweigt ist: über den Browser-Verlauf,
// der auch die Scroll-Position wiederherstellt. Ohne Verlauf (z. B. Link direkt geöffnet) führt
// die Schaltfläche zu fallback. Mit onlyInternal erscheint sie nur nach einem Wechsel innerhalb der Website.
export function BackButton({ fallback, label, onlyInternal }: { fallback: string; label: string; onlyInternal?: boolean }) {
  const internal = useSyncExternalStore(subscribeNever, hasPreviousPage, () => false);
  if (onlyInternal && !internal) return null;
  return (
    <a
      href={fallback}
      className="back-button no-print"
      onClick={(event) => {
        if (!hasPreviousPage()) return;
        event.preventDefault();
        dropCurrent();
        window.history.back();
      }}
    >
      <span aria-hidden="true">←</span> {label}
    </a>
  );
}
