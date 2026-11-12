import { cookies, headers } from "next/headers";
import strings from "./landing-strings.json";

export const LANGS = ["de", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export type LandingStrings = (typeof strings)["de"];

export function isLang(value: string | undefined | null): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value);
}

// Sprache: zuerst die gespeicherte Wahl, sonst die Sprache des Browsers, sonst Deutsch.
export async function getLang(): Promise<Lang> {
  const stored = (await cookies()).get("lang")?.value;
  if (isLang(stored)) return stored;
  const accepted = (await headers()).get("accept-language") ?? "";
  for (const part of accepted.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return "de";
}

export function landingStrings(lang: Lang): LandingStrings {
  return strings[lang];
}

export const VIDEO_NOTE: Record<Lang, string | null> = {
  de: null,
  en: "The video is in German for now.",
  ru: "Видео пока только на немецком языке.",
};

export const ACCOUNT_DELETED: Record<Lang, string> = {
  de: "Dein Konto wurde gelöscht.",
  en: "Your account has been deleted.",
  ru: "Твой аккаунт удалён.",
};

export const SOUND_ON: Record<Lang, string> = {
  de: "Ton einschalten",
  en: "Turn sound on",
  ru: "Включить звук",
};
