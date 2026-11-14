import ideas from "./ideas.json";
import type { Lang } from "./i18n";

// Die vier Ideen-Seiten, in der Reihenfolge der Kacheln auf der Startseite.
export const IDEA_SLUGS = ["kleidung", "strasse", "musik", "geschenk"] as const;
export type IdeaSlug = (typeof IDEA_SLUGS)[number];

export const IDEA_STYLE: Record<IdeaSlug, string> = {
  kleidung: "orange",
  strasse: "blue",
  musik: "grey",
  geschenk: "ink",
};

export function isIdeaSlug(value: string): value is IdeaSlug {
  return (IDEA_SLUGS as readonly string[]).includes(value);
}

export function ideaTexts(lang: Lang) {
  return ideas[lang];
}
