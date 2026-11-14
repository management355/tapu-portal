import kinds from "./kinds.json";
import type { Lang } from "./i18n";

// Die zwei Arten von Knöpfen: offen (taPu) und geheim (xtaPu).
export const KIND_SLUGS = ["tapu", "xtapu"] as const;
export type KindSlug = (typeof KIND_SLUGS)[number];

export function isKindSlug(value: string): value is KindSlug {
  return (KIND_SLUGS as readonly string[]).includes(value);
}

export function kindTexts(lang: Lang) {
  return kinds[lang];
}
