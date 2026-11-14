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
  lockedH: string; lockedP: string; pinLabel: string; open: string; wrong: string; tooMany: string;
}> = {
  de: {
    home: "Zur Startseite", file: "Hinterlegte Datei", reported: "Danke, die Meldung ist angekommen.",
    report: "Inhalt melden", reportQuestion: "Was stimmt mit diesem Inhalt nicht? (optional)", reportSend: "Meldung abschicken",
    emptyH: "Hier ist noch nichts hinterlegt", emptyP: "Der Besitzer dieses Knopfes hat noch keine Botschaft ausgewählt.",
    unclaimedH: "Dieser Knopf wartet auf dich", unclaimedP: "Übernimm ihn in dein Konto und hinterlege deine erste Botschaft.",
    claim: "Knopf übernehmen", missingH: "Nichts gefunden", missingP: "Diese Adresse gehört zu keinem aktiven Knopf.",
    language: "Sprache",
    lockedH: "Dieser Knopf ist geheim", lockedP: "Gib den Zahlencode ein, um die Botschaft zu sehen.",
    pinLabel: "Zahlencode", open: "Öffnen", wrong: "Der Zahlencode stimmt nicht. Bitte versuche es noch einmal.",
    tooMany: "Zu viele falsche Versuche. Bitte warte zehn Minuten und versuche es dann noch einmal.",
  },
  en: {
    home: "Go to home page", file: "Attached file", reported: "Thank you, your report has been received.",
    report: "Report this content", reportQuestion: "What is wrong with this content? (optional)", reportSend: "Send report",
    emptyH: "Nothing has been left here yet", emptyP: "The owner of this button has not chosen a message yet.",
    unclaimedH: "This button is waiting for you", unclaimedP: "Add it to your account and leave your first message.",
    claim: "Claim this button", missingH: "Nothing found", missingP: "This address does not belong to an active button.",
    language: "Language",
    lockedH: "This button is secret", lockedP: "Enter the code to see the message.",
    pinLabel: "Code", open: "Open", wrong: "That code is not correct. Please try again.",
    tooMany: "Too many wrong attempts. Please wait ten minutes and try again.",
  },
  ru: {
    home: "На главную", file: "Прикреплённый файл", reported: "Спасибо, жалоба получена.",
    report: "Пожаловаться на содержимое", reportQuestion: "Что не так с этим содержимым? (необязательно)", reportSend: "Отправить жалобу",
    emptyH: "Здесь пока ничего нет", emptyP: "Владелец этой кнопки ещё не выбрал послание.",
    unclaimedH: "Эта кнопка ждёт тебя", unclaimedP: "Добавь её в свой аккаунт и оставь первое послание.",
    claim: "Забрать кнопку", missingH: "Ничего не найдено", missingP: "Этот адрес не принадлежит активной кнопке.",
    language: "Язык",
    lockedH: "Эта кнопка секретная", lockedP: "Введи цифровой код, чтобы увидеть послание.",
    pinLabel: "Цифровой код", open: "Открыть", wrong: "Код неверный. Попробуй ещё раз.",
    tooMany: "Слишком много неверных попыток. Подожди десять минут и попробуй снова.",
  },
};

export const PORTAL_LABEL: Record<Lang, string> = {
  de: "Mein Portal",
  en: "My portal",
  ru: "Мой портал",
};

export const TRY_STRINGS: Record<Lang, {
  title: string; lead: string; local: string; textLabel: string; fileLabel: string; record: string; remove: string; rotate: string; play: string;
  previewH: string; previewEmpty: string; saveH: string; saveP: string; save: string; haveAccount: string;
  carry: string; tooBig: string; example: string; home: string; language: string;
}> = {
  de: {
    title: "Probier es aus", lead: "Schreib etwas, wähle ein Foto oder nimm ein Video auf. Rechts siehst du sofort, wie deine Botschaft nach dem Scannen aussieht.",
    local: "Alles bleibt auf deinem Gerät. Es wird nichts hochgeladen und nichts gespeichert, solange du kein Konto anlegst.",
    textLabel: "Dein Text", fileLabel: "Bild, Audio oder Video auswählen", record: "Video mit dem Handy aufnehmen", remove: "Datei entfernen", rotate: "Video drehen", play: "Abspielen",
    previewH: "So sieht es nach dem Scannen aus", previewEmpty: "Noch leer. Schreib links etwas oder wähle eine Datei.",
    saveH: "Gefällt es dir?", saveP: "Zum dauerhaften Speichern und für deinen eigenen QR-Code brauchst du ein Konto. Das dauert eine Minute.",
    save: "Speichern und Konto anlegen", haveAccount: "Ich habe schon ein Konto",
    carry: "Dein Text wird nach der Anmeldung übernommen. Foto, Audio oder Video wählst du dort noch einmal aus, weil es dein Gerät erst dann verlässt.",
    tooBig: "Die Datei ist größer als 50 MB. Zum Ansehen hier geht das, speichern lässt sie sich später aber nicht.",
    example: "Lieber erst ein Beispiel ansehen", home: "Startseite", language: "Sprache",
  },
  en: {
    title: "Try it out", lead: "Write something, pick a photo or record a video. On the right you immediately see what your message looks like after scanning.",
    local: "Everything stays on your device. Nothing is uploaded or stored until you create an account.",
    textLabel: "Your text", fileLabel: "Choose a picture, audio or video", record: "Record a video with your phone", remove: "Remove file", rotate: "Rotate video", play: "Play",
    previewH: "What it looks like after scanning", previewEmpty: "Still empty. Write something on the left or choose a file.",
    saveH: "Like it?", saveP: "To keep it and get your own QR code you need an account. It takes a minute.",
    save: "Save and create an account", haveAccount: "I already have an account",
    carry: "Your text is carried over after you sign in. You pick the photo, audio or video again there, because that is when it first leaves your device.",
    tooBig: "The file is larger than 50 MB. You can look at it here, but it can't be saved later.",
    example: "I'd rather see an example first", home: "Home", language: "Language",
  },
  ru: {
    title: "Попробуй", lead: "Напиши что-нибудь, выбери фото или сними видео. Справа сразу видно, как твоё послание выглядит после сканирования.",
    local: "Всё остаётся на твоём устройстве. Ничего не загружается и не сохраняется, пока ты не создашь аккаунт.",
    textLabel: "Твой текст", fileLabel: "Выбрать картинку, аудио или видео", record: "Снять видео на телефон", remove: "Убрать файл", rotate: "Повернуть видео", play: "Воспроизвести",
    previewH: "Так это выглядит после сканирования", previewEmpty: "Пока пусто. Напиши что-нибудь слева или выбери файл.",
    saveH: "Нравится?", saveP: "Чтобы сохранить послание и получить свой QR-код, нужен аккаунт. Это займёт минуту.",
    save: "Сохранить и создать аккаунт", haveAccount: "У меня уже есть аккаунт",
    carry: "Текст перенесётся после входа. Фото, аудио или видео нужно будет выбрать ещё раз, потому что только тогда оно покинет твоё устройство.",
    tooBig: "Файл больше 50 МБ. Посмотреть здесь можно, но сохранить его потом не получится.",
    example: "Сначала посмотреть пример", home: "На главную", language: "Язык",
  },
};

export const BACK_LABEL: Record<Lang, string> = { de: "Zurück", en: "Back", ru: "Назад" };
