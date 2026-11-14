"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordVisit } from "@/lib/nav-trail";

// Hält fest, welche Seiten in diesem Tab nacheinander besucht wurden (für die Schaltfläche "Zurück").
export function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    recordVisit(pathname);
  }, [pathname]);
  return null;
}
