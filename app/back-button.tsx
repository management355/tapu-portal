"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { dropCurrent, hasPreviousPage } from "@/lib/nav-trail";

function subscribeNever() {
  return () => {};
}

// "Zurück" bringt an die Stelle, von der man hierher abgezweigt ist: über den Browser-Verlauf,
// der auch die Scroll-Position wiederherstellt. Ohne Verlauf (z. B. Link direkt geöffnet) führt
// die Schaltfläche zu fallback. Mit onlyInternal erscheint sie nur nach einem Wechsel innerhalb der Website.
export function BackButton({ fallback, label, onlyInternal }: { fallback: string; label: string; onlyInternal?: boolean }) {
  // Der Pfad kommt von Next, weil die Adresszeile beim Seitenwechsel erst nach dem Zeichnen umspringt.
  const pathname = usePathname();
  const internal = useSyncExternalStore(subscribeNever, () => hasPreviousPage(pathname), () => false);
  if (onlyInternal && !internal) return null;
  return (
    <a
      href={fallback}
      className="back-button no-print"
      onClick={(event) => {
        if (!hasPreviousPage(pathname)) return;
        event.preventDefault();
        dropCurrent();
        window.history.back();
      }}
    >
      <span aria-hidden="true">←</span> {label}
    </a>
  );
}
