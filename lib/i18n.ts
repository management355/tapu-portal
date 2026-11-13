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

export const SCAN_STRINGS: Record<Lang, {
  home: string; file: string; reported: string; report: string; reportQuestion: string; reportSend: string;
  emptyH: string; emptyP: string; unclaimedH: string; unclaimedP: string; claim: string;
  missingH: string; missingP: string; language: string;
}> = {
  de: {
    home: "Zur Startseite", file: "Hinterlegte Datei", reported: "Danke, die Meldung ist angekommen.",
    report: "Inhalt melden", reportQuestion: "Was stimmt mit diesem Inhalt nicht? (optional)", reportSend: "Meldung abschicken",
    emptyH: "Hier ist noch nichts hinterlegt", emptyP: "Der Besitzer dieses Knopfes hat noch keine Botschaft ausgewählt.",
    unclaimedH: "Dieser Knopf wartet auf dich", unclaimedP: "Übernimm ihn in dein Konto und hinterlege deine erste Botschaft.",
    claim: "Knopf übernehmen", missingH: "Nichts gefunden", missingP: "Diese Adresse gehört zu keinem aktiven Knopf.",
    language: "Sprache",
  },
  en: {
    home: "Go to home page", file: "Attached file", reported: "Thank you, your report has been received.",
    report: "Report this content", reportQuestion: "What is wrong with this content? (optional)", reportSend: "Send report",
    emptyH: "Nothing has been left here yet", emptyP: "The owner of this button has not chosen a message yet.",
    unclaimedH: "This button is waiting for you", unclaimedP: "Add it to your account and leave your first message.",
    claim: "Claim this button", missingH: "Nothing found", missingP: "This address does not belong to an active button.",
    language: "Language",
  },
  ru: {
    home: "На главную", file: "Прикреплённый файл", reported: "Спасибо, жалоба получена.",
    report: "Пожаловаться на содержимое", reportQuestion: "Что не так с этим содержимым? (необязательно)", reportSend: "Отправить жалобу",
    emptyH: "Здесь пока ничего нет", emptyP: "Владелец этой кнопки ещё не выбрал послание.",
    unclaimedH: "Эта кнопка ждёт тебя", unclaimedP: "Добавь её в свой аккаунт и оставь первое послание.",
    claim: "Забрать кнопку", missingH: "Ничего не найдено", missingP: "Этот адрес не принадлежит активной кнопке.",
    language: "Язык",
  },
};

export const PORTAL_LABEL: Record<Lang, string> = {
  de: "Mein Portal",
  en: "My portal",
  ru: "Мой портал",
};
